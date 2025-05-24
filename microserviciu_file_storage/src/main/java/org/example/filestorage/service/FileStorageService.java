package org.example.filestorage.service;

import org.example.filestorage.config.FileStorageConfig;
import org.example.filestorage.exception.FileStorageException;
import org.example.filestorage.exception.MyFileNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    @Autowired
    public FileStorageService(FileStorageConfig fileStorageConfig) {
        this.fileStorageLocation = fileStorageConfig.getUploadDirPath();

        try {
            // Create the directory if it doesn't exist
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new FileStorageException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    /**
     * Stores a multipart file to the configured upload directory with a unique filename.
     * @param file The file to be stored.
     * @return The unique filename generated for the stored file.
     * @throws FileStorageException if the file cannot be stored.
     */
    public String storeFile(MultipartFile file) {
        // Normalize file name and extract extension
        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String filenameExtension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            filenameExtension = originalFilename.substring(dotIndex);
        }

        // Generate a unique filename using UUID to avoid overwriting and security issues
        String uniqueFilename = UUID.randomUUID().toString() + filenameExtension;

        try {
            // Check if the unique filename contains invalid characters (e.g., path traversal attempts)
            if (uniqueFilename.contains("..")) {
                throw new FileStorageException("Filename contains invalid path sequence " + uniqueFilename);
            }

            // Resolve the target path for the file
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFilename);
            // Copy file to the target location, replacing if a file with the same name already exists (unlikely with UUID)
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return uniqueFilename; // Return the unique filename
        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + uniqueFilename + ". Please try again!", ex);
        }
    }

    /**
     * Loads a file as a Spring Resource from the storage location.
     * @param filename The unique filename of the file to load.
     * @return A Spring Resource representing the file.
     * @throws MyFileNotFoundException if the file does not exist.
     */
    public Resource loadFileAsResource(String filename) {
        try {
            // Resolve the file path and normalize it
            Path filePath = this.fileStorageLocation.resolve(filename).normalize();
            // Create a URL resource from the file path
            Resource resource = new UrlResource(filePath.toUri());

            // Check if the resource exists
            if (resource.exists()) {
                return resource;
            } else {
                throw new MyFileNotFoundException("File not found " + filename);
            }
        } catch (MalformedURLException ex) {
            throw new MyFileNotFoundException("File not found " + filename, ex);
        }
    }
}