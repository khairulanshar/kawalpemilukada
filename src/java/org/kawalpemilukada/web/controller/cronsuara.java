/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.web.controller;

import static com.googlecode.objectify.ObjectifyService.ofy;
import java.io.IOException;
import java.text.ParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;
import org.kawalpemilukada.model.KandidatWilayah;
import org.kawalpemilukada.model.SuaraKandidat;
import org.kawalpemilukada.model.Wilayah;
import static org.kawalpemilukada.web.controller.CommonServices.createDataSuara;
import static org.kawalpemilukada.web.controller.CommonServices.createDataSuaraLoop;

/**
 *
 * @author khairulanshar
 */
public class cronsuara extends HttpServlet {

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
            throws ServletException, IOException, ParseException {
        boolean isCronTask = "true".equals(request.getHeader("X-AppEngine-Cron"));
        if (!isCronTask) {
            return;
        }
        String[] filters = request.getRequestURI().replace("/cronsuara/", "").split("/");
        String tahun = filters[0];
        String tingkat = filters[1];
        String parentkpuid = filters[2];
        List<KandidatWilayah> kandidatWilayahs = CommonServices.filterKandidatWilayah(tahun, tingkat, "parentkpuid", parentkpuid);
        for (KandidatWilayah kandidatWilayah : kandidatWilayahs) {
            Map<String, SuaraKandidat> suaraKandidat = new HashMap<>();
            for (int i = 0; i < kandidatWilayah.kandidat.size(); ++i) {
                JSONObject kandidat = kandidatWilayah.toJSONObject(i);
                SuaraKandidat suarakandidat = new SuaraKandidat();
                suarakandidat.nama = kandidat.get("nama").toString();
                suarakandidat.urut = Long.parseLong(kandidat.get("urut").toString());
                suarakandidat.img_url = kandidat.get("img_url").toString();
                suaraKandidat.put(suarakandidat.urut.toString(), suarakandidat);
            }
            List<Wilayah> wilayahList = CommonServices.filterWilayah(kandidatWilayah.tahun, kandidatWilayah.kpuid, "", "");
            int jumlahTPS = createDataSuaraLoop(wilayahList, suaraKandidat, tingkat, kandidatWilayah.namas, kandidatWilayah.uruts);
            List<Wilayah> wilayahList0 = CommonServices.filterWilayah(kandidatWilayah.tahun, kandidatWilayah.parentkpuid, "kpuid", kandidatWilayah.kpuid);
            Wilayah w = wilayahList0.get(0);
            w.jumlahTPS = jumlahTPS;
            if (tingkat.equalsIgnoreCase(CommonServices.tingkat1)) {
                w.sudahDisetup1 = "Y";
            } else {
                w.sudahDisetup2 = "Y";
            }
            ofy().save().entity(w).now();
            createDataSuara(w, suaraKandidat, tingkat, kandidatWilayah.namas, kandidatWilayah.uruts);
            kandidatWilayah.dikunci = "Y";
            ofy().save().entity(kandidatWilayah).now();
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
        try {
            processRequest(request, response);
        } catch (ParseException ex) {
            //Logger.getLogger(cronsuara.class.getName()).log(Level.SEVERE, null, ex);
        }
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
        try {
            processRequest(request, response);
        } catch (ParseException ex) {
            //Logger.getLogger(cronsuara.class.getName()).log(Level.SEVERE, null, ex);
        }
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
