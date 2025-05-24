package org.example.filestorage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.example.filestorage.config.FileStorageConfig;

@SpringBootApplication
@EnableConfigurationProperties({FileStorageConfig.class}) // Enable our custom config properties
public class FileStorage {

    public static void main(String[] args) {
        SpringApplication.run(FileStorage.class, args);
    }

}