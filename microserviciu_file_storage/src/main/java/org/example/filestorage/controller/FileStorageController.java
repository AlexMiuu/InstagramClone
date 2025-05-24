package org.example.filestorage.controller;

import org.example.filestorage.service.FileStorageService;
import org.example.filestorage.exception.MyFileNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;

@RestController
@RequestMapping("/files") // Base path for all endpoints in this controller
public class FileStorageController {

    private final FileStorageService fileStorageService;

    @Autowired
    public FileStorageController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    /**
     * REST endpoint to upload a file.
     * Accepts a file, stores it, and returns a success message with the download URI.
     *
     * @param file The file to upload (received as MultipartFile).
     * @return ResponseEntity containing a success message and the download URI.
     */
    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        // Store the file and get its unique filename
        String fileName = fileStorageService.storeFile(file);

        // Construct the download URI for the uploaded file
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/files/")
                .path(fileName) // Use the unique filename
                .toUriString();

        return ResponseEntity.ok("File uploaded successfully! Download URI: " + fileDownloadUri);
    }

    /**
     * REST endpoint to download a file by its unique filename.
     * Returns the file as a response, setting appropriate headers for download.
     *
     * @param filename The unique filename of the file to download.
     * @param request HttpServletRequest to determine file's MIME type.
     * @return ResponseEntity containing the file as a Resource.
     */
    @GetMapping("/{filename:.+}") // Regex to allow dot in filename (e.g., mydocument.pdf)
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename, HttpServletRequest request) {
        // Load file as Resource
        Resource resource = fileStorageService.loadFileAsResource(filename);

        // Try to determine file's content type dynamically
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // Log this, but proceed with default content type if determination fails
            System.err.println("Could not determine file type for " + filename + ": " + ex.getMessage());
        }

        // Fallback to the default content type (application/octet-stream) if type could not be determined
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType)) // Set the determined content type
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"") // Force download
                .body(resource); // Return the file resource
    }

    /**
     * Global exception handler for MyFileNotFoundException specifically within this controller.
     * Returns a 404 Not Found response when a file is not found.
     *
     * @param ex The MyFileNotFoundException thrown.
     * @return ResponseEntity with 404 status and error message.
     */
    @ExceptionHandler(MyFileNotFoundException.class)
    public ResponseEntity<String> handleFileNotFound(MyFileNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}