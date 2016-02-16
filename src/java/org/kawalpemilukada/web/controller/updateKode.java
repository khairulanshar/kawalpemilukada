/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.web.controller;

import static com.googlecode.objectify.ObjectifyService.ofy;
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONArray;
import org.json.simple.JSONValue;
import org.kawalpemilukada.model.UserData;
import org.kawalpemilukada.model.Wilayah;

/**
 *
 * @author khairulanshar
 */
public class updateKode extends HttpServlet {

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
        String[] filters = request.getRequestURI().replace("/updateKode/", "").replace("/updatekode/", "").split("/");
        String tahun = filters[0];
        String parentid = filters[1];

        InputStream feedStream = new FileInputStream("dist/data/prop.json");
        InputStreamReader is = new InputStreamReader(feedStream);
        StringBuilder sb1 = new StringBuilder();
        BufferedReader br = new BufferedReader(is);
        String read = br.readLine();
        while (read != null) {
            sb1.append(read);
            read = br.readLine();
        }
        JSONArray propinsis = (JSONArray) JSONValue.parse(sb1.toString());

        for (int i = 0; i < propinsis.size(); i++) {
            Wilayah wilayah = new Wilayah(CommonServices.setParentId(tahun, "0"), tahun);
            JSONArray propinsi = (JSONArray) propinsis.get(i);
            wilayah.id = CommonServices.tingkat1 + propinsi.get(2).toString();
            wilayah.kpuid = propinsi.get(2).toString();
            wilayah.nama = propinsi.get(3).toString();
            wilayah.tingkat = CommonServices.tingkat1;
            wilayah.kode = propinsi.get(1).toString();
            wilayah.parentkode = "0";
            wilayah.sudahDisetup1 = "Y";
            wilayah.sudahDisetup2 = "Y";
            ofy().save().entity(wilayah).now();
        }

        feedStream = new FileInputStream("dist/data/kabkota" + tahun + "_new.csv");
        is = new InputStreamReader(feedStream);
        br = new BufferedReader(is);
        read = br.readLine();
        String cvsSplitBy = ",";
        int i = 0;
        while (read != null) {
            i++;
            try {
                String[] wilayahline = read.split(cvsSplitBy);
                Wilayah wilayah = new Wilayah(CommonServices.setParentId(tahun, wilayahline[0]), tahun);
                wilayah.id = CommonServices.tingkat2 + wilayahline[2];
                wilayah.kpuid = wilayahline[2];
                wilayah.nama = wilayahline[3].replace("\"", "");
                wilayah.tingkat = CommonServices.tingkat2;
                wilayah.kode = wilayahline[4];
                wilayah.parentkode = wilayahline[5];
                wilayah.sudahDisetup1 = "Y";
                wilayah.sudahDisetup2 = "Y";
                ofy().save().entity(wilayah).now();
            } catch (Exception e) {
            }
            read = br.readLine();
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
