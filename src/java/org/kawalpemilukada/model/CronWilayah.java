/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.model;

import static com.googlecode.objectify.ObjectifyService.ofy;
import com.googlecode.objectify.cmd.QueryKeys;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.kawalpemilukada.web.controller.CommonServices;
import static org.kawalpemilukada.web.controller.CommonServices.getWeb;
import static org.kawalpemilukada.web.controller.CommonServices.getWebWithdata;

/**
 *
 * @author khairulanshar
 */
public class CronWilayah extends HttpServlet {

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
        UserData user = CommonServices.getUser(request);
        if (user.uid.toString().length() > 0 && user.userlevel >= 5000) {

        } else {
            boolean isCronTask = "true".equals(request.getHeader("X-AppEngine-Cron"));
            if (!isCronTask) {
                return;
            }
        }
        String[] filters = request.getRequestURI().replace("/CronWilayah/", "").replace("/cronwilayah/", "").split("/");
        try {
            String tahun = filters[0];
            String parentid = filters[1];
            List<Wilayah> kabupatens = CommonServices.filterWilayah(tahun, parentid, "", "");
            for (Wilayah kabupaten : kabupatens) {
                try {
                    List<Wilayah> kecamatans = CommonServices.filterWilayah(tahun, kabupaten.kpuid, "", "");
                    for (Wilayah kecamatan : kecamatans) {
                        try {
                            List<Wilayah> desas = CommonServices.filterWilayah(tahun, kecamatan.kpuid, "", "");
                            for (Wilayah desa : desas) {
                                try {
                                    //Map<String, Object> params = new LinkedHashMap<>();
                                    //params.put("g-recaptcha-response", "");
                                    //params.put("id_kelurahan", desa.kpuid);
                                    //String result = getWebWithdata("https://pilkada2015.kpu.go.id//wilayah/get_tps_by_id_kelurahan_json", params);
                                    String result = getWeb("http://data.kpu.go.id/open/v1/api.php?cmd=pollingstation_browse&wilayah_id=" + desa.kpuid);
                                    JSONObject input0 = (JSONObject) JSONValue.parse(result);
                                    JSONArray input = (JSONArray) input0.get("data");
                                    for (int i = 0; i < input.size(); ++i) {
                                        try {
                                            JSONObject wilayahjson = (JSONObject) input.get(i);
                                            Wilayah wilayah = new Wilayah(CommonServices.setParentId(tahun, desa.kpuid), tahun);
                                            wilayah.id = CommonServices.tingkat5 + wilayahjson.get("nomor_tps").toString();
                                            wilayah.kpuid = wilayahjson.get("tps_id").toString();
                                            wilayah.nama = wilayahjson.get("nomor_tps").toString();
                                            wilayah.tingkat = CommonServices.tingkat5;
                                            ofy().save().entity(wilayah).now();
                                        } catch (Exception e) {
                                        }
                                    }
                                    /*String text = getWeb("https://data.kpu.go.id/dpt2015.php?cmd=select&grandparent=" + kecamatan.kpuid
                                     + "&parent=" + desa.kpuid);
                                     if (text.length() > 0) {
                                     text = text.substring(text.indexOf("<option"));
                                     text = text.substring(0, text.indexOf("</select>"));
                                     String[] filterx = text.split("value");
                                     for (String value : filterx) {
                                     try {
                                     value = value.replaceAll("<option", "");
                                     value = value.replaceAll("'", "");
                                     value = value.replaceAll("\"", "");
                                     value = value.replaceAll(" ", "");
                                     value = value.replaceAll("=", "");
                                     value = value.replaceAll("value=", "");
                                     value = value.replaceAll("</option>", "");
                                     value = value.substring(0, value.indexOf(">") + 1);
                                     value = value.replaceAll(">", "");
                                     if (value.length() > 0) {
                                     Wilayah wilayah = new Wilayah(CommonServices.setParentId(tahun, desa.kpuid), tahun);
                                     wilayah.id = CommonServices.tingkat5 + value;
                                     wilayah.kpuid = value;
                                     wilayah.nama = value;
                                     wilayah.tingkat = CommonServices.tingkat5;
                                     ofy().save().entity(wilayah).now();
                                     }
                                     } catch (Exception e) {
                                     }
                                     }
                                     }*/
                                } catch (Exception e) {
                                }
                            }
                        } catch (Exception e) {
                        }
                    }
                } catch (Exception e) {
                }
            }
            QueryKeys<Wilayah> query = ofy()
                    .load()
                    .type(Wilayah.class).filter("tingkat", CommonServices.tingkat5).filter("tahun", tahun).keys();
            Dashboard dashboard = CommonServices.getDashboard(CommonServices.setParentId(tahun, "0"));
            int jumlah = query.list().size();
            dashboard.TPS = jumlah + "";
            ofy().save().entity(dashboard).now();
        } catch (Exception e) {
        }

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
