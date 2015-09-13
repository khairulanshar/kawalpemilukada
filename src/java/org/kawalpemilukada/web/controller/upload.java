/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.web.controller;

import com.google.appengine.api.blobstore.BlobKey;
import com.google.appengine.api.blobstore.BlobstoreService;
import com.google.appengine.api.blobstore.BlobstoreServiceFactory;
import com.google.appengine.api.files.AppEngineFile;
import com.google.appengine.api.files.FileService;
import com.google.appengine.api.files.FileServiceFactory;
import com.google.appengine.api.files.FileWriteChannel;
import com.google.appengine.api.images.Image;
import com.google.appengine.api.images.ImagesService;
import com.google.appengine.api.images.ImagesServiceFactory;
import com.google.appengine.api.images.OutputSettings;
import com.google.appengine.api.images.Transform;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.ByteBuffer;
import java.util.List;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

/**
 *
 * @author khairulanshar
 */
public class upload extends HttpServlet {

    private final BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        Map<String, List<BlobKey>> blobs = blobstoreService.getUploads(request);
        JSONArray retval = new JSONArray();
        String pI = (String) request.getParameter("pI");
        if (pI == null) {
            pI = "0";
        }
        String fI = (String) request.getParameter("fI");
        if (fI == null) {
            fI = "0";
        }
        String sizew = (String) request.getParameter("sizew");
        if (sizew == null) {
            sizew = "";
        }
        String sizeh = (String) request.getParameter("sizeh");
        if (sizeh == null) {
            sizeh = "";
        }
        int pi = Integer.parseInt(pI);
        for (int i = 0; i < pi; i++) {
            JSONArray record = new JSONArray();
            String pN = (String) request.getParameter("pN" + i);
            String pT = (String) request.getParameter("pT" + i);
            record.add(pN);
            record.add(pT);
            for (BlobKey blobKey : blobs.get("pF" + i)) {

                /*
                 try {
                 ImagesService imagesService = ImagesServiceFactory.getImagesService();
                 String urlFoto = imagesService.getServingUrl(blobKey, true);
                 record.add(urlFoto);
                 } catch (IllegalArgumentException ie) {
                 record.add("/serve?blob-key=" + blobKey.getKeyString());
                 }*/
                try {
                    ImagesService imagesService = ImagesServiceFactory.getImagesService();
                    Image oldImage = ImagesServiceFactory.makeImageFromBlob(blobKey);
                    OutputSettings settings = new OutputSettings(ImagesService.OutputEncoding.PNG);
                    settings.setQuality(60);
                    int w = 300;
                    int h = 400;
                    if (sizeh.length() > 0 && sizew.length() > 0) {
                        w = Integer.parseInt(sizew);
                        h = Integer.parseInt(sizeh);
                    }
                    Transform transform = ImagesServiceFactory.makeResize(w, h);
                    Image newImage = imagesService.applyTransform(transform, oldImage, settings);
                    byte[] blobData = newImage.getImageData();
                    //save data to blobstore
                    FileService fileService = FileServiceFactory.getFileService();
                    AppEngineFile file = fileService.createNewBlobFile("image/png", pN);
                    FileWriteChannel writeChannel = fileService.openWriteChannel(file, true);
                    writeChannel.write(ByteBuffer.wrap(blobData));
                    writeChannel.closeFinally();
                    BlobKey blobKeyNew = fileService.getBlobKey(file);
                    record.add(blobKeyNew.getKeyString());
                    record.add("/serve?blob-key=" + blobKeyNew.getKeyString());
                } catch (Exception ie) {
                    record.add(blobKey.getKeyString());
                    record.add("/serve?blob-key=" + blobKey.getKeyString());
                }
            }
            retval.add(record);
        }

        int fi = Integer.parseInt(fI);
        for (int i = 0; i < fi; i++) {
            JSONArray record = new JSONArray();
            String fN = (String) request.getParameter("fN" + i);
            String fT = (String) request.getParameter("fT" + i);
            record.add(fN);
            record.add(fT);
            for (BlobKey blobKey : blobs.get("fF" + i)) {
                record.add(blobKey.getKeyString());
                record.add("/serve?blob-key=" + blobKey.getKeyString());
            }
            retval.add(record);
        }

        JSONObject finalJson = new JSONObject();
        finalJson.put("success", "OK");
        finalJson.put("retval", retval);
        response.setCharacterEncoding("utf8");
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        out.print(finalJson);
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

}
