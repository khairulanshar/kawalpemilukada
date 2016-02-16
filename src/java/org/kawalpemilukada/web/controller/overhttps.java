/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.web.controller;

import static com.googlecode.objectify.ObjectifyService.ofy;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.kawalpemilukada.model.MapData;
import static org.kawalpemilukada.web.controller.CommonServices.delimeter;
import static org.kawalpemilukada.web.controller.CommonServices.getWeb;

/**
 *
 * @author khairulanshar
 */
public class overhttps extends HttpServlet {

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
        String geoservices = new CommonServices().getPropValues("kpu.properties", "geoservices", request);
        String geoservices_q1 = new CommonServices().getPropValues("kpu.properties", "geoservices_q1", request);
        String geoservices_q2 = new CommonServices().getPropValues("kpu.properties", "geoservices_q2", request);
        String[] filters = request.getRequestURI().replace("/overhttps/", "").split("/");
        String tingkat = filters[0];
        String tahun = filters[1];
        String layer = filters[2];
        String mapfilter = filters[3];
        String url = geoservices + layer + geoservices_q1 + mapfilter + geoservices_q2;
        System.out.println(url);
        String result = getWeb(url);
        if (result == null || result.length() == 0) {
            result = getWeb(url);
        }
        if (result == null || result.length() == 0) {
            result = getWeb(url);
        }
        if (result == null || result.length() == 0) {
            result = getWeb(url);
        }
        if (result == null || result.length() == 0) {
            try {
                String filename = tingkat + tahun + mapfilter.replaceAll("No_prov%3D", "").replace("ID2013%3D", "").replaceAll("'", "");
                JSONParser parser = new JSONParser();
                Object obj = parser.parse(new FileReader("dist/data/" + filename + ".json"));
                JSONObject jsonObject = (JSONObject) obj;
                result = JSONValue.toJSONString(jsonObject);
            } catch (Exception e) {
                result = "";
            }
            if (result == null || result.length() == 0) {
                MapData map = ofy().load().type(MapData.class).id(tingkat + delimeter + tahun + delimeter + layer + mapfilter).now();
                if (map != null) {
                    result = map.data;
                }
            }
        } else {
            MapData map = ofy().load().type(MapData.class).id(tingkat + delimeter + tahun + delimeter + layer + mapfilter).now();
            if (map != null) {
                map = new MapData();
                map.id = tingkat + delimeter + tahun + delimeter + layer + mapfilter;
                map.data = result;
                ofy().save().entity(map).now();
            }
        }
        PrintWriter out = response.getWriter();
        response.setContentType("text/html;charset=UTF-8");
        out.print(result);
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
