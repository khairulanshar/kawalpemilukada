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
import java.util.ArrayList;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.json.simple.parser.JSONParser;
import org.kawalpemilukada.model.CrowdProfilData;
import org.kawalpemilukada.model.Dashboard;
import org.kawalpemilukada.model.DataSuara;
import org.kawalpemilukada.model.KandidatWilayah;
import org.kawalpemilukada.model.StringKey;
import org.kawalpemilukada.model.UserData;
import static org.kawalpemilukada.web.controller.CommonServices.setParentId1;

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
        JSONArray returnVal = new JSONArray();
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
                        Dashboard dashboard = CommonServices.getDashboard(CommonServices.setParentId("2015", "0"));
                        dashboard.kandidat = CommonServices.getKandidatSize() + "";
                        ofy().save().entity(dashboard).now();
                        returnVal.add(JSONValue.parse(gson.toJson(kandidatWilayah)));
                    }
                } catch (Exception e) {
                }
            } else if (method.equalsIgnoreCase("single")) {
                String tingkatId = filters[3];
                Key<StringKey> parentKey = Key.create(StringKey.class, CommonServices.setParentId(tahun, tingkat));
                Key<KandidatWilayah> keyWithParent = Key.create(parentKey, KandidatWilayah.class, tingkat + tingkatId);
                List<KandidatWilayah> kandidatWilayahs = ofy().load().type(KandidatWilayah.class).ancestor(keyWithParent).list();
                returnVal.add(JSONValue.parse(gson.toJson(kandidatWilayahs)));
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
                Object obj1 = parser.parse(new FileReader("dist/data/danakampanye.json"));
                JSONObject jsonObject1 = (JSONObject) obj1;
                String urldanakampanye = (String) jsonObject1.get(tingkatId + "");
                infoKandidat.add(urldanakampanye);
                returnVal.add(infoKandidat);
                if (tingkat.equalsIgnoreCase("dataKandidat")) {
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
                                text = text.substring(0, text.indexOf("<div id=\"edit-form\"") - 1);
                            }
                            returnVal.add(text);
                        }
                    } catch (Exception e) {

                    } finally {
                        if (conn != null) {
                            conn.disconnect();
                        }
                    }
                }
            } else if (method.equalsIgnoreCase("update-profil-crowd")) {
                try {
                    UserData user = CommonServices.getUser(request);
                    if (user.uid.toString().length() > 0 && user.userlevel >= 1000) {
                        String kpu_paslon_id = filters[3];
                        Key<StringKey> parentKey = Key.create(StringKey.class, CommonServices.setParentId(tahun, tingkat));
                        Key<CrowdProfilData> keyWithParent = Key.create(parentKey, CrowdProfilData.class, kpu_paslon_id);
                        List<CrowdProfilData> crowdProfilDatas = ofy().load().type(CrowdProfilData.class).ancestor(keyWithParent).list();

                        CrowdProfilData crowddata = crowdProfilDatas.get(0);
                        crowddata.direview_date = CommonServices.JakartaTime();
                        crowddata.direview_id = user.uid;
                        crowddata.direview_img = user.imgurl;
                        crowddata.direview_link = user.link;
                        crowddata.direview_nama = user.nama;
                        crowddata.validated = filters[4];
                        ofy().save().entity(crowddata).now();
                        returnVal.add(JSONValue.parse(gson.toJson(crowddata)));
                    }
                } catch (Exception e) {
                }
            } else if (method.equalsIgnoreCase("get-profil-crowd")) {
                Key<StringKey> parentKey = Key.create(StringKey.class, CommonServices.setParentId(tahun, tingkat));
                List<CrowdProfilData> crowdProfilDatas = ofy().load().type(CrowdProfilData.class).ancestor(parentKey).list();
                returnVal.add(JSONValue.parse(gson.toJson(crowdProfilDatas)));
            } else if (method.equalsIgnoreCase("get-profil-crowd-single")) {

                String kpu_paslon_id = filters[3];
                Key<StringKey> parentKey = Key.create(StringKey.class, CommonServices.setParentId(tahun, tingkat));
                Key<CrowdProfilData> keyWithParent = Key.create(parentKey, CrowdProfilData.class, kpu_paslon_id);
                List<CrowdProfilData> crowdProfilDatas = ofy().load().type(CrowdProfilData.class).ancestor(keyWithParent).list();
                try {
                    if (!crowdProfilDatas.isEmpty()) {
                        CrowdProfilData crowddata = crowdProfilDatas.get(0);
                        if (crowddata.validated.equalsIgnoreCase("Y")) {
                            returnVal.add(JSONValue.parse(gson.toJson(crowdProfilDatas)));
                        } else if (crowddata.validated.equalsIgnoreCase("P")) {
                            returnVal.add(JSONValue.parse(gson.toJson(crowdProfilDatas)));
                        }
                    }
                } catch (Exception e) {
                }
            } else if (method.equalsIgnoreCase("post-profil-crowd")) {
                try {
                    UserData user = CommonServices.getUser(request);
                    if (user.uid.toString().length() > 0) {
                        StringBuilder sb = new StringBuilder();
                        String line = null;
                        BufferedReader reader = request.getReader();
                        while ((line = reader.readLine()) != null) {
                            sb.append(line);
                        }
                        JSONObject input = (JSONObject) JSONValue.parse(sb.toString());
                        String kpu_paslon_id = filters[3];
                        Key<StringKey> parentKey = Key.create(StringKey.class, CommonServices.setParentId(tahun, tingkat));
                        Key<CrowdProfilData> keyWithParent = Key.create(parentKey, CrowdProfilData.class, kpu_paslon_id);
                        List<CrowdProfilData> crowdProfilDatas = ofy().load().type(CrowdProfilData.class).ancestor(keyWithParent).list();
                        CrowdProfilData crowddata = null;
                        if (crowdProfilDatas.isEmpty()) {
                            crowddata = new CrowdProfilData(tahun, tingkat, kpu_paslon_id);
                        } else {
                            crowddata = crowdProfilDatas.get(0);
                        }
                        if (crowddata.validated.equalsIgnoreCase("N") || (crowddata.validated.equalsIgnoreCase("P") && crowddata.diupdate_id.equalsIgnoreCase(user.uid))) {
                            crowddata.diupdate_date = CommonServices.JakartaTime();
                            crowddata.diupdate_id = user.uid;
                            crowddata.diupdate_img = user.imgurl;
                            crowddata.diupdate_link = user.link;
                            crowddata.diupdate_nama = user.nama;
                            crowddata.validated = "P";
                            JSONObject maindata = (JSONObject) input.get("main");
                            crowddata.kpuid = maindata.get("kpuid").toString();
                            crowddata.nama = maindata.get("nama").toString();
                            crowddata.parentkpuid = maindata.get("parentkpuid").toString();
                            crowddata.parentNama = maindata.get("parentNama").toString();

                            crowddata.visi = maindata.get("visi").toString();
                            crowddata.misi = maindata.get("misi").toString();
                            crowddata.program_pendidikan = maindata.get("program_pendidikan").toString();
                            crowddata.program_hukum = maindata.get("program_hukum").toString();
                            crowddata.program_ekonomi = maindata.get("program_ekonomi").toString();
                            crowddata.dana_kampanye = maindata.get("dana_kampanye").toString();
                            JSONArray ketua = (JSONArray) input.get("ketuaArray");
                            ArrayList<String> listdata = new ArrayList<String>();
                            for (int i = 0; i < ketua.size(); i++) {
                                listdata.add(ketua.get(i).toString());
                            }
                            crowddata.addProfil("ketua", listdata);
                            JSONArray wakil = (JSONArray) input.get("wakilArray");
                            ArrayList<String> listdatawakil = new ArrayList<String>();
                            for (int i = 0; i < wakil.size(); i++) {
                                listdatawakil.add(wakil.get(i).toString());
                            }
                            crowddata.addProfil("wakil", listdatawakil);
                            ofy().save().entity(crowddata).now();
                        }
                        returnVal.add(JSONValue.parse(gson.toJson(crowddata)));
                    }
                } catch (Exception e) {
                }
            } else if (method.equalsIgnoreCase("refreshagregasi")) {
                JSONParser parser = new JSONParser();
                Object obj = parser.parse(new FileReader("dist/data/dataKandidat.json"));
                JSONObject jsonObject = (JSONObject) obj;
                Object obj2 = parser.parse(new FileReader("dist/data/pemilih.json"));
                JSONObject pemilih = (JSONObject) obj2;
                String tingkatId = filters[3];
                Key<StringKey> parentKey = Key.create(StringKey.class, CommonServices.setParentId(tahun, tingkat));
                Key<KandidatWilayah> keyWithParent = Key.create(parentKey, KandidatWilayah.class, tingkat + tingkatId);
                List<KandidatWilayah> kandidatWilayahs = ofy().load().type(KandidatWilayah.class).ancestor(keyWithParent).list();
                try {
                    KandidatWilayah kandidatWilayah = kandidatWilayahs.get(0);
                    kandidatWilayah.jumlahTPS = 0;
                    kandidatWilayah.jumlahTPSdilock = 0;
                    kandidatWilayah.suarasah = 0;
                    kandidatWilayah.suaratidaksah = 0;
                    try {
                        kandidatWilayah.totalpemilih = Integer.parseInt(pemilih.get(kandidatWilayah.nama).toString());
                    } catch (Exception e) {
                        kandidatWilayah.totalpemilih=0;
                    }
                    kandidatWilayah.set0();
                    Key<StringKey> key1 = Key.create(StringKey.class, setParentId1(tingkat, tahun, tingkatId));
                    List<DataSuara> dataSuaraList = ofy().load().type(DataSuara.class).ancestor(key1).list();
                    for (DataSuara d : dataSuaraList) {
                        kandidatWilayah.jumlahTPS += d.jumlahTPS;
                        kandidatWilayah.jumlahTPSdilock += d.jumlahTPSdilock;
                        kandidatWilayah.suarasah += d.suarasah;
                        kandidatWilayah.suaratidaksah += d.suaratidaksah;
                        for (Integer temp : d.uruts) {
                            kandidatWilayah.addsuara(temp,
                                    d.suaraKandidat.get(temp.toString() + "").suaraTPS,
                                    d.suaraKandidat.get(temp.toString() + "").suaraVerifikasiC1,
                                    d.suaraKandidat.get(temp.toString() + "").suaraKPU,
                                    jsonObject);
                        }
                    }
                    ofy().save().entity(kandidatWilayah).now();
                } catch (Exception e) {
                }
                returnVal.add(JSONValue.parse(gson.toJson(kandidatWilayahs)));
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
                } catch (Exception e) {
                }
            } else {
                if (filters.length < 4) {
                    List<KandidatWilayah> kandidatWilayahs = CommonServices.filterKandidatWilayah(tahun, tingkat, "", "");
                    returnVal.add(JSONValue.parse(gson.toJson(kandidatWilayahs)));
                } else {
                    String fileterby = filters[3];
                    String fileter = filters[4];
                    List<KandidatWilayah> kandidatWilayahs = CommonServices.filterKandidatWilayah(tahun, tingkat, fileterby, fileter);
                    returnVal.add(JSONValue.parse(gson.toJson(kandidatWilayahs)));
                }
            }
        } catch (Exception e) {
        }
        PrintWriter out = response.getWriter();
        response.setContentType("text/html;charset=UTF-8");
        out.print(JSONValue.toJSONString(returnVal));
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
