/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.web.controller;

import com.googlecode.objectify.Key;
import static com.googlecode.objectify.ObjectifyService.ofy;
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
import org.kawalpemilukada.model.DataSuara;
import org.kawalpemilukada.model.KandidatWilayah;
import org.kawalpemilukada.model.StringKey;
import org.kawalpemilukada.model.UserData;
import static org.kawalpemilukada.web.controller.CommonServices.getKpuData;
import static org.kawalpemilukada.web.controller.CommonServices.getKpuDataTPS;
import static org.kawalpemilukada.web.controller.CommonServices.getWebWithdata;
import static org.kawalpemilukada.web.controller.CommonServices.setParentId1;

/**
 *
 * @author khairulanshar
 */
public class cronpilkada2015 extends HttpServlet {

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
        String[] filters = request.getRequestURI().replace("/cronpilkada2015/", "").split("/");
        String tahun = filters[0];
        String tingkat = filters[1];
        String type = filters[2];
        String parentkpuid = filters[3];
        List<KandidatWilayah> kandidatWilayahs = CommonServices.filterKandidatWilayah(tahun, tingkat, type, parentkpuid);
        for (KandidatWilayah kandidatWilayah : kandidatWilayahs) {
            try {
                getWilayah(tingkat, kandidatWilayah.kpuid, kandidatWilayah);
            } catch (Exception e0) {
            }
        }
    }

    private static void getWilayah(String tingkat, String kpuid, KandidatWilayah kandidatWilayah) {
        try {
            Key<StringKey> key = Key.create(StringKey.class, setParentId1(tingkat, kandidatWilayah.tahun, kpuid));
            List<DataSuara> dataSuaras = ofy().load().type(DataSuara.class).ancestor(key).list();
            for (DataSuara dataSuara : dataSuaras) {
                try {
                    if (dataSuara.tingkat.equalsIgnoreCase("TPS")) {
                        getKpuDataTPS(dataSuara,kandidatWilayah.kpuid);
                    } else {
                        getKpuData(dataSuara,kandidatWilayah.kpuid);
                        getWilayah(tingkat, dataSuara.kpuid, kandidatWilayah);
                    }
                } catch (Exception ee) {
                    //System.out.println(dataSuara.nama +"==>"+ee.getMessage());
                }
            }
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
