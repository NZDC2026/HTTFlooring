# HTT Management project instructions

When adding or changing a user-facing feature, include a clearly labelled sample preview that demonstrates the populated result. For workflows, cover the meaningful states, such as pending and completed, and explain where to see the sample in the delivery notes. Use realistic synthetic values in a read-only preview or isolated test workspace. Keep sample records out of live financial, payroll, inventory, and notification workflows unless the user explicitly requests a specific write. Preserve existing sample coverage when editing a feature.

After completing an application change, run the relevant checks and production web build, then automatically restart the online web service and verify public availability. The user has authorized these restarts. Preserve the existing data directory and deployment settings. Report any failed deployment or verification. Documentation-only changes do not require a restart.
