package com.htt.management.architecture;

import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;
import static org.assertj.core.api.Assertions.assertThat;

/** Checks production bytecode, including field, method, annotation and constructor dependencies. */
class ModuleArchitectureTests {
    private static final String ROOT = "com.htt.management.";
    private static final JavaClasses PRODUCTION = new ClassFileImporter()
            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
            .importPackages("com.htt.management");

    // Planned names reserve boundaries, not runtime modules. See docs/MODULES.md.
    private static final Map<String, Set<String>> DEPENDENCIES = Map.ofEntries(
            Map.entry("platform", Set.of()),
            Map.entry("identity", Set.of("platform")),
            Map.entry("notification", Set.of("identity", "platform")),
            Map.entry("crm", Set.of("identity", "platform")),
            Map.entry("catalog", Set.of("identity", "platform")),
            Map.entry("pricing", Set.of("catalog", "crm", "identity", "platform")),
            Map.entry("inventory", Set.of("catalog", "identity", "platform")),
            Map.entry("sales", Set.of("crm", "catalog", "pricing", "inventory", "identity", "platform")),
            Map.entry("fulfilment", Set.of("sales", "inventory", "identity", "platform")),
            Map.entry("purchasing", Set.of("crm", "catalog", "inventory", "identity", "platform")),
            Map.entry("finance", Set.of("crm", "catalog", "identity", "platform")),
            Map.entry("integration", Set.of("catalog", "inventory", "platform")),
            Map.entry("document", Set.of("identity", "platform")),
            Map.entry("reporting", Set.of("identity", "crm", "catalog", "pricing", "inventory",
                    "sales", "fulfilment", "purchasing", "finance", "platform")));

    // Existing flat identity module: explicit, narrow bridges until it needs internal packages.
    private static final Set<String> IDENTITY_CONTRACTS = Set.of(
            "AccessSnapshot", "VerifiedUser", "VerifiedToken", "ResourceAccess", "AccessAudit", "CustomerBranchAccess");

    @Test
    void productionModulesFollowTheDependencyDirection() {
        assertThat(PRODUCTION).isNotEmpty();
        for (JavaClass origin : PRODUCTION) {
            if (origin.getName().equals(ROOT + "HttManagementApiApplication")) continue;
            String source = module(origin);
            assertThat(DEPENDENCIES).as("Declared module for %s", origin.getName()).containsKey(source);
            for (var dependency : origin.getDirectDependenciesFromSelf()) {
                JavaClass target = dependency.getTargetClass();
                if (!target.getPackageName().startsWith(ROOT) || source.equals(module(target))) continue;
                assertThat(DEPENDENCIES.get(source)).as(dependency.getDescription()).contains(module(target));
            }
        }
    }

    @Test
    void modulesHaveNoDependencyCycles() {
        slices().matching("com.htt.management.(*)..")
                .should().beFreeOfCycles().check(PRODUCTION);
    }

    @Test
    void crossModuleCallsUseContractsRatherThanControllersEntitiesOrRepositories() {
        for (JavaClass origin : PRODUCTION) {
            for (var dependency : origin.getDirectDependenciesFromSelf()) {
                JavaClass target = dependency.getTargetClass();
                if (!target.getPackageName().startsWith(ROOT) || module(origin).equals(module(target))) continue;
                assertThat(isExposed(target, origin)).as(dependency.getDescription()).isTrue();
            }
        }
    }

    @Test
    void domainAndPublicContractsDoNotDependOnFrameworksOrExternalTransports() {
        // Inventory contracts exist; other domain/contract packages are created only when needed.
        noClasses().that().resideInAnyPackage("com.htt.management..domain..", "com.htt.management..contract..")
                .should().dependOnClassesThat().resideInAnyPackage(
                        "org.springframework..", "jakarta.persistence..", "org.hibernate..", "java.sql..",
                        "javax.sql..", "java.net.http..", "com.rabbitmq..", "com.google.firebase..")
                .allowEmptyShould(true).check(PRODUCTION);
    }

    @Test
    void sourceProvidersCannotBypassAnInventoryApplicationUseCase() {
        noClasses().that().resideOutsideOfPackages("com.htt.management.inventory..", "com.htt.management.integration..")
                .should().dependOnClassesThat()
                .haveNameMatching("com\\.htt\\.management\\.inventory\\.contract\\.InventorySource(\\$.*)?")
                .check(PRODUCTION);
        noClasses().that().resideInAPackage("..api..").or().haveSimpleNameEndingWith("Controller")
                .should().dependOnClassesThat()
                .haveNameMatching("com\\.htt\\.management\\.inventory\\.contract\\.InventorySource(\\$.*)?")
                .check(PRODUCTION);
    }

    private static boolean isExposed(JavaClass target, JavaClass origin) {
        String targetModule = module(target);
        if (target.getPackageName().equals(ROOT + targetModule + ".contract")
                || target.getPackageName().startsWith(ROOT + targetModule + ".contract.")) return true;
        if (targetModule.equals("platform")) {
            // Configuration/security wiring is private; only HTTP/event building blocks are shared.
            return target.getPackageName().equals(ROOT + "platform.web")
                    || target.getPackageName().equals(ROOT + "platform.events");
        }
        if (!targetModule.equals("identity")) return false;
        String topLevelName = target.getName().substring((ROOT + "identity.").length()).split("\\$")[0];
        if (IDENTITY_CONTRACTS.contains(topLevelName)) return true;
        // Existing SSE revocation checks and bean wiring re-read access. Not a general DAO export.
        return topLevelName.equals("AccessRepository") && Set.of(
                ROOT + "notification.NotificationAccess", ROOT + "notification.NotificationConfiguration",
                ROOT + "notification.NotificationConfiguration$ApiConfiguration")
                .contains(origin.getName());
    }

    private static String module(JavaClass type) {
        return type.getPackageName().substring(ROOT.length()).split("\\.")[0];
    }
}
