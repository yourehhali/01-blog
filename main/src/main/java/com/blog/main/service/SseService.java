package com.blog.main.service;

import com.blog.main.dto.UserDtos.NotificationResponse;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class SseService {

    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter connect(Long userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.computeIfAbsent(userId, ignored -> new CopyOnWriteArrayList<>()).add(emitter);

        Runnable removeEmitter = () -> {
            List<SseEmitter> userEmitters = emitters.get(userId);
            if (userEmitters != null) {
                userEmitters.remove(emitter);
                if (userEmitters.isEmpty()) {
                    emitters.remove(userId);
                }
            }
        };

        emitter.onCompletion(removeEmitter);
        emitter.onTimeout(removeEmitter);
        emitter.onError(error -> removeEmitter.run());

        try {
            emitter.send(SseEmitter.event().name("init").data("connected"));
        } catch (Exception exception) {
            removeEmitter.run();
        }

        return emitter;
    }

    public void sendNotification(Long userId, NotificationResponse notification) {
        sendEvent(userId, "notification", notification);
    }

    public void sendSessionInvalidated(Long userId, String reason) {
        sendEvent(userId, "session-invalidated", Map.of("reason", reason));
    }

    public void sendEvent(Long userId, String eventName, Object payload) {
        List<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters == null || userEmitters.isEmpty()) {
            return;
        }

        for (SseEmitter emitter : userEmitters) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(payload));
            } catch (Exception exception) {
                userEmitters.remove(emitter);
                if (userEmitters.isEmpty()) {
                    emitters.remove(userId);
                }
            }
        }
    }
}
