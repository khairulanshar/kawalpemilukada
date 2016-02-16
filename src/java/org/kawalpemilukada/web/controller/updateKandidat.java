/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.web.controller;

import com.googlecode.objectify.Key;
import static com.googlecode.objectify.ObjectifyService.ofy;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONValue;
import org.kawalpemilukada.model.KandidatWilayah;
import org.kawalpemilukada.model.StringKey;
import org.kawalpemilukada.model.UserData;
import org.kawalpemilukada.model.Wilayah;

/**
 *
 * @author khairulanshar
 */
public class updateKandidat extends HttpServlet {

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
        String[] filters = request.getRequestURI().replace("/updateKandidat/", "").replace("/updatekandidat/", "").split("/");
        String tingkat = filters[0];
        String tahun = filters[1];
        List<KandidatWilayah> kandidatWilayahs = CommonServices.filterKandidatWilayah(tahun, tingkat, "", "");
        for (KandidatWilayah kandidatWilayah : kandidatWilayahs) {
            Key<StringKey> parentKey1 = Key.create(StringKey.class, CommonServices.setParentId(tahun, kandidatWilayah.parentkpuid));
            Key<Wilayah> keyWithParent1 = Key.create(parentKey1, Wilayah.class, tingkat + kandidatWilayah.kpuid);
            List<Wilayah> wilayahs = ofy().load().type(Wilayah.class).ancestor(keyWithParent1).list();
            Wilayah wilayah = wilayahs.get(0);
            kandidatWilayah.kode=wilayah.kode;
            kandidatWilayah.parentkode=wilayah.parentkode;
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
