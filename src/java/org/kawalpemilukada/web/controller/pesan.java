/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.web.controller;

import com.google.appengine.api.blobstore.BlobstoreService;
import com.google.appengine.api.blobstore.BlobstoreServiceFactory;
import com.google.gson.Gson;
import com.googlecode.objectify.Key;
import static com.googlecode.objectify.ObjectifyService.ofy;
import com.googlecode.objectify.cmd.Query;
import com.googlecode.objectify.cmd.QueryKeys;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.LinkedHashMap;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONArray;
import org.json.simple.JSONValue;
import org.kawalpemilukada.model.KandidatWilayah;
import org.kawalpemilukada.model.Pesan;
import org.kawalpemilukada.model.StringKey;
import org.kawalpemilukada.model.UserData;

/**
 *
 * @author khairulanshar
 */
public class pesan extends HttpServlet {

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
        String[] filters = request.getRequestURI().replace("/pesan/", "").split("/");
        String type = filters[0];
        LinkedHashMap records = new LinkedHashMap();
        records.put("pesan", false);
        Gson gson = new Gson();
        StringBuilder sb = new StringBuilder();
        String line = null;
        BufferedReader reader = request.getReader();
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        JSONArray input = (JSONArray) JSONValue.parse(sb.toString());
        if (type.equalsIgnoreCase("GET")) {
            records.put("pesans", new JSONArray());
            records.put("tanggapanPesans", new JSONArray());
            records.put("setujuPesans", new JSONArray());
            records.put("tidakSetujuPesans", new JSONArray());
            records.put("cursorStr", "");
            try {
                String key = input.get(0).toString();
                if (key.equalsIgnoreCase("Pesan Untuk Semua")) {
                    key = "wall";
                } else if (key.equalsIgnoreCase("Pesan Untuk Saya")) {
                    try {
                        UserData user = CommonServices.getUser(request);
                        key = "msg" + user.uid.toString();
                    } catch (Exception e) {
                        key = "wall";
                    }
                }
                String filter = input.get(1).toString();
                String filterBy = input.get(2).toString();
                String cursorStr = input.get(3).toString();
                int limit = Integer.parseInt(input.get(4).toString());
                if (limit > 50) {
                    limit = 50;
                }
                int offset = Integer.parseInt(input.get(5).toString());
                if (offset < 0) {
                    offset = 0;
                }
                Query<Pesan> pesan = CommonServices.getPesan(key, filter, filterBy, cursorStr, offset, limit);
                //record.put("cursorStr", query.iterator().getCursor().toWebSafeString());
                records.put("cursorStr", "");
                if (input.get(0).toString().equalsIgnoreCase("Pesan Untuk Semua")) {
                    records.put("pesans", JSONValue.parse(gson.toJson(pesan.list())));
                } else if (input.get(0).toString().equalsIgnoreCase("Pesan Untuk Saya")) {
                    records.put("pesans", JSONValue.parse(gson.toJson(pesan.list())));
                } else if (input.get(0).toString().contains("#tanggapan#")) {
                    records.put("tanggapanPesans", JSONValue.parse(gson.toJson(pesan.list())));
                } else if (input.get(0).toString().contains("#setuju#")) {
                    records.put("setujuPesans", JSONValue.parse(gson.toJson(pesan.list())));
                } else if (input.get(0).toString().contains("#tidaksetuju#")) {
                    records.put("tidakSetujuPesans", JSONValue.parse(gson.toJson(pesan.list())));
                } else {
                    records.put("pesans", JSONValue.parse(gson.toJson(pesan.list())));
                }

            } catch (Exception e) {
            }
        } else if (type.equalsIgnoreCase("COUNT")) {
            try {
                String key = input.get(0).toString();
                if (key.equalsIgnoreCase("Pesan Untuk Semua")) {
                    key = "wall";
                } else if (key.equalsIgnoreCase("Pesan Untuk Saya")) {
                    try {
                        UserData user = CommonServices.getUser(request);
                        key = "msg" + user.uid.toString();
                    } catch (Exception e) {
                        key = "wall";
                    }
                }
                int pesan = CommonServices.countPesan(key);
                records.put("countPesan", pesan);
            } catch (Exception e) {
            }
        } else if (type.equalsIgnoreCase("POST")) {
            try {
                UserData user = CommonServices.getUser(request);
                if (user.uid.toString().length() > 0 && user.terverifikasi.equalsIgnoreCase("Y")) {
                    String key = input.get(0).toString();
                    String parentId = input.get(10).toString();

                    if (key.contains("#hide#") || key.contains("#edit#") || key.contains("#tanggapan#") || key.contains("#setuju#") || key.contains("#tidaksetuju#")) {
                        String parentKeyString = input.get(11).toString();
                        Key<StringKey> parentKey = Key.create(StringKey.class, parentKeyString);
                        Key<Pesan> keyWithParent = Key.create(parentKey, Pesan.class, Long.parseLong(parentId));
                        Pesan pesan = ofy().load().type(Pesan.class).ancestor(keyWithParent).first().now();
                        if (key.contains("#edit#")) {
                            pesan.msg = input.get(5).toString();
                        }
                        if (key.contains("#hide#") && (user.uid.equalsIgnoreCase(pesan.dari_id) || user.userlevel >= 500)) {
                            pesan.status = "hide";
                        }
                        if (key.contains("#tanggapan#")) {
                            pesan.addTanggapan(user.uid.toString(), user.nama, user.imgurl, user.link, input.get(5).toString());
                        }
                        if (key.contains("#setuju#")) {
                            pesan.addSetuju(user.uid.toString(), user.nama, user.imgurl, user.link, input.get(5).toString());
                        }
                        if (key.contains("#tidaksetuju#")) {
                            pesan.addTidakSetuju(user.uid.toString(), user.nama, user.imgurl, user.link, input.get(5).toString());
                        }
                        ofy().save().entity(pesan).now();
                        records.put("parentPesan", JSONValue.parse(gson.toJson(pesan)));
                    } else {
                        if (key.equalsIgnoreCase("Pesan Untuk Semua")) {
                            key = "wall";
                        } else if (key.equalsIgnoreCase("Pesan Untuk Saya")) {
                            key = "msg" + user.uid;
                        }
                        Pesan pesan = new Pesan(key);
                        pesan.dari_id = user.uid;
                        CommonServices.addPoinToUser(user, 10);
                        records.put("user", JSONValue.parse(gson.toJson(user)));
                        pesan.dari_nama = user.nama;
                        pesan.dari_img = user.imgurl;
                        pesan.dari_link = user.link;
                        pesan.untuk_id = input.get(1).toString();
                        pesan.untuk_nama = input.get(2).toString();
                        pesan.untuk_img = input.get(3).toString();
                        pesan.untuk_link = input.get(4).toString();
                        pesan.msg = input.get(5).toString();
                        pesan.icon = input.get(6).toString();
                        int limit = Integer.parseInt(input.get(8).toString());
                        if (limit > 50) {
                            limit = 50;
                        }
                        int offset = Integer.parseInt(input.get(9).toString());
                        if (offset < 0) {
                            offset = 0;
                        }

                        JSONArray jsonArrays = (JSONArray) input.get(16);
                        for (Object jsonArray1 : jsonArrays) {
                            JSONArray file = (JSONArray) jsonArray1;
                            pesan.addFile(file.get(0).toString(), file.get(1).toString(), file.get(2).toString(), file.get(3).toString());
                        }
                        records.put("parentId", parentId);
                        ofy().save().entity(pesan).now();
                        records.put("pesan", JSONValue.parse(gson.toJson(pesan)));
                        if ((!key.equalsIgnoreCase("Pesan Untuk Semua")) && (!key.equalsIgnoreCase("Pesan Untuk Saya"))) {
                            int countpesan = CommonServices.countPesan(key);
                            String tahun = input.get(12).toString();
                            String tingkat = input.get(13).toString();
                            String tingkatId = input.get(14).toString();
                            String urut = input.get(15).toString();
                            Key<StringKey> parentKey = Key.create(StringKey.class, CommonServices.setParentId(tahun, tingkat));
                            Key<KandidatWilayah> keyWithParent = Key.create(parentKey, KandidatWilayah.class, tingkat + tingkatId);
                            List<KandidatWilayah> kandidatWilayahs = ofy().load().type(KandidatWilayah.class).ancestor(keyWithParent).list();
                            KandidatWilayah k = kandidatWilayahs.get(0);
                            k.updatekandidat("", "", Integer.parseInt(urut), countpesan);
                            ofy().save().entity(k).now();
                            records.put("kandidatWilayah", JSONValue.parse(gson.toJson(k)));
                        }

                    }

                    if (key.equalsIgnoreCase("Pesan Untuk Semua") || key.equalsIgnoreCase("Pesan Untuk Saya")) {

                    } else {

                    }
                }
            } catch (Exception e) {
                System.out.println(e.toString());
            }
        } else if (type.equalsIgnoreCase("getUrlFile")) {
            records.put("uploadurl", "");
            try {
                BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();
                String uploadurl = blobstoreService.createUploadUrl("/upload");
                records.put("uploadurl", uploadurl);
            } catch (Exception e) {
            }

        }
        PrintWriter out = response.getWriter();
        response.setContentType("text/html;charset=UTF-8");
        out.print(JSONValue.toJSONString(records));
        out.flush();
        out.close();
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
