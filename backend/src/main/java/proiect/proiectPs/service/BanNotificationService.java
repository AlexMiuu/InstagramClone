package proiect.proiectPs.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class BanNotificationService {

    private final RestTemplate restTemplate;
    private final String baseUrl = "http://localhost:8000"; // Change this to actual endpoint

    public BanNotificationService() {
        this.restTemplate = new RestTemplate();
    }

    public String notifyBan(String email, String phoneNumber) {
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .pathSegment("ban", email, phoneNumber)
                .toUriString();
        System.out.println(url);
        try {
            String response = restTemplate.getForObject(url, String.class);
            System.out.println("Ban notification sent: " + response);
            return response;
        } catch (Exception e) {
            e.printStackTrace();
            return "Failed to call ban endpoint.";
        }
    }
}
