/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.web.controller;

import com.google.gson.Gson;
import com.googlecode.objectify.Key;
import static com.googlecode.objectify.ObjectifyService.ofy;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.json.simple.parser.JSONParser;
import org.kawalpemilukada.model.KandidatWilayah;
import org.kawalpemilukada.model.StringKey;
import org.kawalpemilukada.model.UserData;

/**
 *
 * @author khairulanshar
 */
public class kandidat extends HttpServlet {

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
        JSONArray kandidats = new JSONArray();
        try {
            String[] filters = request.getRequestURI().replace("/kandidat/", "").split("/");
            String method = filters[0];
            String tahun = filters[1];
            String tingkat = filters[2];
            Gson gson = new Gson();
            if (method.equalsIgnoreCase("post")) {
                StringBuilder sb = new StringBuilder();
                String line = null;
                BufferedReader reader = request.getReader();
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
                JSONObject input = (JSONObject) JSONValue.parse(sb.toString());
                try {
                    UserData user = CommonServices.getUser(request);
                    if (user.uid.toString().length() > 0 && user.userlevel >= 1000) {
                        String tingkatId = filters[3];
                        Key<StringKey> parentKey = Key.create(StringKey.class, CommonServices.setParentId(tahun, tingkat));
                        Key<KandidatWilayah> keyWithParent = Key.create(parentKey, KandidatWilayah.class, tingkat + tingkatId);
                        List<KandidatWilayah> kandidatWilayahs = ofy().load().type(KandidatWilayah.class).ancestor(keyWithParent).list();
                        KandidatWilayah kandidatWilayah;
                        if (kandidatWilayahs.isEmpty()) {
                            kandidatWilayah = new KandidatWilayah(CommonServices.setParentId(tahun, tingkat), tahun);
                            kandidatWilayah.id = tingkat + tingkatId;
                            if (tingkat.equalsIgnoreCase("Provinsi")) {
                                kandidatWilayah.parentkpuid = "0";
                                kandidatWilayah.parentNama = "Nasional";
                                kandidatWilayah.kpuid = input.get("provinsiId").toString();
                                kandidatWilayah.nama = input.get("provinsi").toString();
                            } else {
                                kandidatWilayah.parentkpuid = input.get("provinsiId").toString();
                                kandidatWilayah.parentNama = input.get("provinsi").toString();
                                kandidatWilayah.kpuid = input.get("kabupatenId").toString();
                                kandidatWilayah.nama = input.get("kabupaten").toString();
                            }
                        } else {
                            kandidatWilayah = kandidatWilayahs.get(0);
                        }
                        kandidatWilayah.addkandidat(input.get("nama").toString(), input.get("img_url").toString(), Integer.parseInt(input.get("urut").toString()), input.get("kpu_id_peserta").toString());
                        ofy().save().entity(kandidatWilayah).now();
                        kandidats.add(JSONValue.parse(gson.toJson(kandidatWilayah)));
                    }
                } catch (Exception e) {}
            } else if (method.equalsIgnoreCase("single")) {
                String tingkatId = filters[3];
                Key<StringKey> parentKey = Key.create(StringKey.class, CommonServices.setParentId(tahun, tingkat));
                Key<KandidatWilayah> keyWithParent = Key.create(parentKey, KandidatWilayah.class, tingkat + tingkatId);
                List<KandidatWilayah> kandidatWilayahs = ofy().load().type(KandidatWilayah.class).ancestor(keyWithParent).list();
                kandidats.add(JSONValue.parse(gson.toJson(kandidatWilayahs)));
            } else if (method.equalsIgnoreCase("get-profil")) {
                String tingkatId = filters[3];
                String urut = filters[4];
                String id = tahun + tingkat + tingkatId + "#" + urut;
                //ProfilKandidat profil = ofy().load().type(ProfilKandidat.class).id(id).now();
                //kandidats.add(JSONValue.parse(gson.toJson(profil)));
            } else if (method.equalsIgnoreCase("get-profil-from-json")) {
                String tingkatId = filters[3];
                JSONParser parser = new JSONParser();
                Object obj = parser.parse(new FileReader("dist/data/" + tingkat + ".json"));
                JSONObject jsonObject = (JSONObject) obj;
                JSONArray infoKandidat = (JSONArray) jsonObject.get(tingkatId + "");
                kandidats.add(infoKandidat);
                HttpURLConnection conn = null;
                URL url;
                try {
                    String infokpu = "http://infopilkada.kpu.go.id/index.php?r=Dashboard/viewdetilparpol&id=";
                    if (!infoKandidat.get(7).toString().equalsIgnoreCase("PARPOL")) {
                        infokpu = "http://infopilkada.kpu.go.id/index.php?r=Dashboard/viewdetilorang&id=";
                    }
                    url = new URL(infokpu + tingkatId);
                    conn = (HttpURLConnection) url.openConnection();
                    conn.setDoOutput(true);
                    conn.setUseCaches(false);
                    conn.setDoInput(true);
                    conn.setRequestMethod("GET");
                    conn.connect();
                    // handle the response
                    int status = conn.getResponseCode();
                    if (status != 200) {
                    } else {
                        BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                        StringBuilder sb1 = new StringBuilder();
                        String read = br.readLine();
                        while (read != null) {
                            sb1.append(read);
                            read = br.readLine();
                        }
                        String text = sb1.toString();
                        if (infoKandidat.get(7).toString().equalsIgnoreCase("PARPOL")) {
                            text = text.substring(text.indexOf("<h1>Data Paslon Dukungan Partai Politik"));
                            text = text.substring(0, text.indexOf("<b>PARTAI PENDUKUNG :</b>"));
                        } else {
                            text = text.substring(text.indexOf("<h1>Data Paslon Dukungan Perorangan"));
                            text = text.substring(0, text.indexOf("<div id=\"edit-form\"")-1);
                        }
                        kandidats.add(text);
                    }
                } catch (Exception e) {
                    
                } finally {
                    if (conn != null) {
                        conn.disconnect();
                    }
                }
            } else if (method.equalsIgnoreCase("post-profil")) {
                String tingkatId = filters[3];
                String urut = filters[4];
                String id = tahun + tingkat + tingkatId + "#" + urut;
                StringBuilder sb = new StringBuilder();
                String line = null;
                BufferedReader reader = request.getReader();
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
                JSONArray input = (JSONArray) JSONValue.parse(sb.toString());
                try {
                    UserData user = CommonServices.getUser(request);
                    if (user.uid.toString().length() > 0 && user.userlevel >= 500) {
                        /*ProfilKandidat profil = new ProfilKandidat();
                         profil.id = id;
                         profil.dibuat_oleh_id = user.uid;
                         profil.dibuat_oleh_nama = user.nama;
                         profil.dibuat_oleh_img = user.imgurl;
                         profil.dibuat_oleh_link = user.link;
                         for (Object jsonArray1 : input) {
                         JSONArray profilArray = (JSONArray) jsonArray1;
                         profil.addkandidat(profilArray.get(0).toString(), profilArray.get(1).toString(), profilArray.get(2).toString(), Integer.parseInt(profilArray.get(3).toString()), profilArray.get(4).toString(), profilArray.get(5).toString(), profilArray.get(6).toString(), profilArray.get(7).toString(), profilArray.get(8).toString(), profilArray.get(9).toString());
                         }
                         ofy().save().entity(profil).now();
                         kandidats.add(JSONValue.parse(gson.toJson(profil)));*/
                    }
                } catch (Exception e) {}
            } else {
                if (filters.length < 4) {
                    List<KandidatWilayah> kandidatWilayahs = CommonServices.filterKandidatWilayah(tahun, tingkat, "", "");
                    kandidats.add(JSONValue.parse(gson.toJson(kandidatWilayahs)));
                }
            }
        } catch (Exception e) {}
        PrintWriter out = response.getWriter();
        response.setContentType("text/html;charset=UTF-8");
        out.print(JSONValue.toJSONString(kandidats));
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
