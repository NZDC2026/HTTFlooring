package com.htt.management.notification;

import java.util.Map;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping({"/api/v1/notifications","/api/portal/v1/notifications"})
@ConditionalOnProperty(name={"htt.notification.enabled","htt.auth.enabled"},havingValue="true")
public class NotificationController {
    private final NotificationStore store;
    private final NotificationAccess access;
    private final SseHub hub;
    public NotificationController(NotificationStore store,NotificationAccess access,SseHub hub) { this.store=store; this.access=access; this.hub=hub; }

    @GetMapping
    @PreAuthorize("@notificationAccess.allowed('notification:read')")
    public NotificationModels.History history(@RequestParam(defaultValue="0") long after,@RequestParam(defaultValue="100") int limit) {
        return store.history(access.session(),after,limit);
    }
    @GetMapping(value="/stream",produces=MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("@notificationAccess.allowed('notification:read')")
    public SseEmitter stream(@RequestHeader(value="Last-Event-ID",defaultValue="0") long after,jakarta.servlet.http.HttpServletResponse response) {
        SseEmitter emitter=hub.open(access.session(),after);
        response.setHeader("Cache-Control","no-store"); response.setHeader("X-Accel-Buffering","no");
        return emitter;
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("@notificationAccess.allowed('notification:read')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markRead(@PathVariable UUID id) {
        if (!store.markRead(access.session(),id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Notification not found.");
    }
    public record DeviceRequest(String platform,String token) {}
    @PostMapping("/devices")
    @PreAuthorize("@notificationAccess.allowed('notification:device')")
    public Map<String,UUID> device(@RequestBody DeviceRequest request) {
        return Map.of("id",store.registerDevice(access.session(),request.platform(),request.token()));
    }
    @DeleteMapping("/devices/{id}")
    @PreAuthorize("@notificationAccess.allowed('notification:device')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void disable(@PathVariable UUID id) { store.disableDevice(access.session(),id); }
}
