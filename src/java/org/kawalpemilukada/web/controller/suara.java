/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.web.controller;

import com.google.gson.Gson;
import com.googlecode.objectify.Key;
import static com.googlecode.objectify.ObjectifyService.ofy;
import com.googlecode.objectify.cmd.QueryKeys;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.kawalpemilukada.model.DataSuara;
import org.kawalpemilukada.model.KandidatWilayah;
import org.kawalpemilukada.model.StringKey;
import org.kawalpemilukada.model.SuaraKandidat;
import org.kawalpemilukada.model.UserData;
import org.kawalpemilukada.model.Wilayah;
import static org.kawalpemilukada.web.controller.CommonServices.addPoinToUser;
import static org.kawalpemilukada.web.controller.CommonServices.createDataSuara;
import static org.kawalpemilukada.web.controller.CommonServices.createDataSuaraLoop;
import static org.kawalpemilukada.web.controller.CommonServices.loopUpdateparent;
import static org.kawalpemilukada.web.controller.CommonServices.setParentId1;
import static org.kawalpemilukada.web.controller.CommonServices.tingkat1;

/**
 *
 * @author khairulanshar
 */
public class suara extends HttpServlet {

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
        JSONArray returnvalue = new JSONArray();
        String[] filters = request.getRequestURI().replace("/suara/", "").split("/");
        String type = filters[0];
        StringBuilder sb = new StringBuilder();
        String line = null;
        BufferedReader reader = request.getReader();
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        
        if (type.equalsIgnoreCase("setup")) {
            try {
                UserData user = CommonServices.getUser(request);
                if (user.uid.toString().length() > 0 && user.userlevel >= 1000) {
                    JSONArray input = (JSONArray) JSONValue.parse(sb.toString());
                    String tingkat = input.get(0).toString();
                    JSONObject wilayah = (JSONObject) input.get(1);
                    JSONObject kandidatWilayahJSON = (JSONObject) input.get(2);

                    JSONObject key0 = (JSONObject) kandidatWilayahJSON.get("key");
                    JSONObject raw = (JSONObject) key0.get("raw");

                    Key<StringKey> parentKey1 = Key.create(StringKey.class, raw.get("name").toString());
                    Key<KandidatWilayah> keyWithParent1 = Key.create(parentKey1, KandidatWilayah.class, kandidatWilayahJSON.get("id").toString());
                    List<KandidatWilayah> kandidatWilayahs = ofy().load().type(KandidatWilayah.class).ancestor(keyWithParent1).list();
                    KandidatWilayah kandidatWilayah = kandidatWilayahs.get(0);
                    String sudahDisetup = "";
                    if (tingkat.equalsIgnoreCase(CommonServices.tingkat1)) {
                        sudahDisetup = wilayah.get("sudahDisetup1").toString();
                    } else {
                        sudahDisetup = wilayah.get("sudahDisetup2").toString();
                    }
                    if (sudahDisetup.equalsIgnoreCase("P")) {
                        Map<String, SuaraKandidat> suaraKandidat = new HashMap<>();
                        for (int i = 0; i < kandidatWilayah.kandidat.size(); ++i) {
                            JSONObject kandidat = kandidatWilayah.toJSONObject(i);
                            SuaraKandidat suarakandidat = new SuaraKandidat();
                            suarakandidat.nama = kandidat.get("nama").toString();
                            suarakandidat.urut = Long.parseLong(kandidat.get("urut").toString());
                            suarakandidat.img_url = kandidat.get("img_url").toString();
                            suaraKandidat.put(suarakandidat.urut.toString(), suarakandidat);
                        }

                        List<Wilayah> wilayahList0 = CommonServices.filterWilayah(kandidatWilayah.tahun, kandidatWilayah.parentkpuid, "kpuid", kandidatWilayah.kpuid);
                        Wilayah w = wilayahList0.get(0);
                        createDataSuara(w, suaraKandidat, tingkat, kandidatWilayah.namas, kandidatWilayah.uruts);
                        List<Wilayah> wilayahList = CommonServices.filterWilayah(wilayah.get("tahun").toString(), wilayah.get("kpuid").toString(), "", "");
                        int jumlahTPS = createDataSuaraLoop(wilayahList, suaraKandidat, tingkat, kandidatWilayah.namas, kandidatWilayah.uruts);
                        if (tingkat.equalsIgnoreCase(tingkat1)) {
                            wilayahList0 = CommonServices.filterWilayah(wilayah.get("tahun").toString(), kandidatWilayah.kpuid, "kpuid", wilayah.get("kpuid").toString());
                            w = wilayahList0.get(0);
                            w.jumlahTPS = jumlahTPS;
                            createDataSuara(w, suaraKandidat, tingkat, kandidatWilayah.namas, kandidatWilayah.uruts);
                        }

                        kandidatWilayah.dikunci = "Y";
                        ofy().save().entity(kandidatWilayah).now();
                        if (tingkat.equalsIgnoreCase(CommonServices.tingkat1)) {
                            w.sudahDisetup1 = "Y";
                        } else {
                            w.sudahDisetup2 = "Y";
                        }
                        ofy().save().entity(w).now();
                        returnvalue.add("OK");
                        Gson gson = new Gson();
                        returnvalue.add(JSONValue.parse(gson.toJson(w)));
                    }
                }
            } catch (Exception e) {
                returnvalue.add("NOTOK");
                returnvalue.add(e.toString());
            }
        }

        if (type.equalsIgnoreCase("save")) {
            try {
                UserData user = CommonServices.getUser(request);
                if (user.uid.toString().length() > 0 && user.terverifikasi.equalsIgnoreCase("Y")) {
                    Gson gson = new Gson();
                    JSONArray input = (JSONArray) JSONValue.parse(sb.toString());
                    JSONObject datasuara = (JSONObject) input.get(0);
                    JSONArray tps_file = (JSONArray) datasuara.get("tps_file");
                    JSONArray wilayah = (JSONArray) input.get(1);
                    JSONObject key0 = (JSONObject) datasuara.get("key");
                    JSONObject raw = (JSONObject) key0.get("raw");
                    Key<StringKey> parentKey = Key.create(StringKey.class, raw.get("name").toString());
                    Key<DataSuara> keyWithParent = Key.create(parentKey, DataSuara.class, datasuara.get("id").toString());
                    DataSuara dataSuara = ofy().load().type(DataSuara.class).ancestor(keyWithParent).first().now();
                    String from = filters[1];
                    String Transfer = "";
                    try {
                        Transfer = filters[2];
                    } catch (Exception e) {
                    }
                    for (Integer temp : dataSuara.uruts) {
                        JSONObject suaraKandidatJSON = (JSONObject) datasuara.get("suaraKandidat");
                        JSONObject suaraKandidat1 = (JSONObject) suaraKandidatJSON.get(temp.toString() + "");
                        if (from.equalsIgnoreCase("HC")) {
                            dataSuara.suaraKandidat.get(temp.toString() + "").suaraTPS = Integer.parseInt(suaraKandidat1.get("suaraTPS").toString());
                        } else {
                            if (Transfer.equalsIgnoreCase("Transfer")) {
                                dataSuara.suaraKandidat.get(temp.toString() + "").suaraVerifikasiC1 = dataSuara.suaraKandidat.get(temp.toString() + "").suaraTPS;
                            } else {
                                dataSuara.suaraKandidat.get(temp.toString() + "").suaraVerifikasiC1 = Integer.parseInt(suaraKandidat1.get("suaraVerifikasiC1").toString());
                            }
                        }
                    }
                    if (from.equalsIgnoreCase("HC")) {
                        if (Transfer.equalsIgnoreCase("withimage")) {
                            dataSuara.addFile(tps_file.get(0).toString(), tps_file.get(1).toString(), tps_file.get(2).toString(), tps_file.get(3).toString());
                        }
                        dataSuara.dilockHC = "Y";
                        dataSuara.statusHC = "R";//review
                        dataSuara.jumlahTPSdilockHC = 0;
                        dataSuara.tps_diupdate_date = CommonServices.JakartaTime();
                        dataSuara.tps_diupdate_id = user.uid;
                        dataSuara.tps_diupdate_img = user.imgurl;
                        dataSuara.tps_diupdate_link = user.link;
                        dataSuara.tps_diupdate_nama = user.nama;
                        dataSuara.suarasahHC = Integer.parseInt(datasuara.get("suarasahHC").toString());
                        dataSuara.suaratidaksahHC = Integer.parseInt(datasuara.get("suaratidaksahHC").toString());
                    } else {
                        dataSuara.dilock = "Y";
                        dataSuara.jumlahTPSdilock = 1;
                        dataSuara.c1_direview_date = CommonServices.JakartaTime();
                        dataSuara.c1_direview_id = user.uid;
                        dataSuara.c1_direview_img = user.imgurl;
                        dataSuara.c1_direview_link = user.link;
                        dataSuara.c1_direview_nama = user.nama;
                        if (Transfer.equalsIgnoreCase("Transfer")) {
                            dataSuara.suarasah = dataSuara.suarasahHC;
                            dataSuara.suaratidaksah = dataSuara.suaratidaksahHC;
                        } else {
                            dataSuara.suarasah = Integer.parseInt(datasuara.get("suarasah").toString());
                            dataSuara.suaratidaksah = Integer.parseInt(datasuara.get("suaratidaksah").toString());
                        }
                    }
                    dataSuara.urllink = input.get(2).toString();
                    dataSuara.kpugambar1 = datasuara.get("kpugambar1").toString();
                    dataSuara.kpugambar2 = datasuara.get("kpugambar2").toString();
                    dataSuara.kpugambar3 = datasuara.get("kpugambar3").toString();
                    dataSuara.kpugambar4 = datasuara.get("kpugambar4").toString();
                    dataSuara.kpugambar5 = datasuara.get("kpugambar5").toString();
                    ofy().save().entity(dataSuara).now();
                    addPoinToUser(user, 100);
                    if (!from.equalsIgnoreCase("HC")) {
                        loopUpdateparent(wilayah, dataSuara, from);
                    }
                    returnvalue.add("OK");
                    returnvalue.add(JSONValue.parse(gson.toJson(dataSuara)));

                }
            } catch (Exception e) {
                returnvalue.add("NOTOK");
                returnvalue.add(e.toString());
            }
        }
        if (type.equalsIgnoreCase("BukaDataC1") || type.equalsIgnoreCase("tiakadac1") || type.equalsIgnoreCase("SetstatusHC") || type.equalsIgnoreCase("TandaiSalah") || type.equalsIgnoreCase("BukaDataHC")) {
            try {
                UserData user = CommonServices.getUser(request);
                if (user.uid.toString().length() > 0 && user.terverifikasi.equalsIgnoreCase("Y")) {
                    Gson gson = new Gson();
                    JSONArray input = (JSONArray) JSONValue.parse(sb.toString());
                    JSONObject datasuara = (JSONObject) input.get(0);
                    JSONArray tps_file = (JSONArray) datasuara.get("tps_file");
                    JSONArray wilayah = (JSONArray) input.get(1);
                    JSONObject key0 = (JSONObject) datasuara.get("key");
                    JSONObject raw = (JSONObject) key0.get("raw");
                    Key<StringKey> parentKey = Key.create(StringKey.class, raw.get("name").toString());
                    Key<DataSuara> keyWithParent = Key.create(parentKey, DataSuara.class, datasuara.get("id").toString());
                    DataSuara dataSuara = ofy().load().type(DataSuara.class).ancestor(keyWithParent).first().now();
                    if (type.equalsIgnoreCase("tiakadac1")) {
                        dataSuara.tidakadaC1 = "Y";
                        dataSuara.jumlahTPStidakadaC1 = 1;
                    }
                    if (type.equalsIgnoreCase("SetstatusHC") && user.userlevel >= 200) {
                        dataSuara.statusHC = "Y";
                        dataSuara.jumlahTPSdilockHC = 1;
                        dataSuara.tps_direview_date = CommonServices.JakartaTime();
                        dataSuara.tps_direview_id = user.uid;
                        dataSuara.tps_direview_img = user.imgurl;
                        dataSuara.tps_direview_link = user.link;
                        dataSuara.tps_direview_nama = user.nama;
                        addPoinToUser(user, 90);
                    }
                    if (type.equalsIgnoreCase("TandaiSalah")) {
                        dataSuara.tandaiSalah = "Y";
                        dataSuara.jumlahEntryC1Salah = 1;
                    }
                    if (type.equalsIgnoreCase("BukaDataHC") && user.userlevel >= 200) {
                        dataSuara.dilockHC = "N";
                        dataSuara.statusHC = "N";
                        dataSuara.jumlahTPSdilockHC = 0;
                    }
                    if (type.equalsIgnoreCase("BukaDataC1") && user.userlevel >= 200) {
                        dataSuara.tandaiSalah = "N";
                        dataSuara.jumlahEntryC1Salah = 0;
                        dataSuara.dilock = "N";
                        dataSuara.jumlahTPSdilock = 0;
                    }
                    dataSuara.urllink = input.get(2).toString();
                    ofy().save().entity(dataSuara).now();
                    if (type.equalsIgnoreCase("SetstatusHC")|| type.equalsIgnoreCase("BukaDataHC")) {
                        loopUpdateparent(wilayah, dataSuara, "HC");
                    } else {
                        loopUpdateparent(wilayah, dataSuara, "C1");
                    }
                    addPoinToUser(user, 10);
                    returnvalue.add("OK");
                    returnvalue.add(JSONValue.parse(gson.toJson(dataSuara)));
                }
            } catch (Exception e) {
                returnvalue.add("NOTOK");
                returnvalue.add(e.toString());
            }
        }
        if (type.equalsIgnoreCase("get")) {
            try {
                String tahun = filters[1];
                String tingkat = filters[2];
                String kpuid = filters[3];
                Key<StringKey> key = Key.create(StringKey.class, setParentId1(tingkat, tahun, kpuid));
                List<DataSuara> dataSuara = ofy().load().type(DataSuara.class).ancestor(key).list();
                Gson gson = new Gson();
                returnvalue.add(JSONValue.parse(gson.toJson(dataSuara)));
                returnvalue.add("OK");
                returnvalue.add(setParentId1(tingkat, tahun, kpuid));
            } catch (Exception e) {
                returnvalue.add("NOTOK");
                returnvalue.add(e.toString());
            }

        }
        if (type.equalsIgnoreCase("delete")) {
            try {
                UserData user = CommonServices.getUser(request);
                if (user.uid.toString().length() > 0 && user.userlevel >= 1000) {
                    QueryKeys<DataSuara> s = ofy().load().type(DataSuara.class).keys();
                    ofy().delete().keys(s.list()).now();
                    QueryKeys<Wilayah> w = ofy().load().type(Wilayah.class).keys();
                    ofy().delete().keys(w.list()).now();
                    returnvalue.add("OK");
                }
                returnvalue.add("NOTOK");
            } catch (Exception e) {
                returnvalue.add("NOTOK");
                returnvalue.add(e.toString());
            }

        }

        PrintWriter out = response.getWriter();
        response.setContentType("text/html;charset=UTF-8");
        out.print(JSONValue.toJSONString(returnvalue));
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
