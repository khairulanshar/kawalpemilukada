/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.web.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;
import java.util.LinkedHashMap;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import static org.kawalpemilukada.web.controller.CommonServices.getJsonNik;
import static org.kawalpemilukada.web.controller.CommonServices.getWeb;

/**
 *
 * @author khairulanshar
 */
public class cekktp extends HttpServlet {

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
        String[] filters = request.getRequestURI().replace("/cekktp/", "").split("/");
        String type = filters[0];
        String nik = filters[1];
        PrintWriter out = response.getWriter();
        response.setContentType("text/html;charset=UTF-8");
        boolean robot = false;
        String msg="";

        try {
            String ipAddress = request.getHeader("X-FORWARDED-FOR");
            if (ipAddress == null) {
                ipAddress = request.getRemoteAddr();
            }
            Long date = (Long) request.getSession().getAttribute("time" + ipAddress);
            if (date == null) {
                date = new Date().getTime();
                request.getSession().setAttribute("time" + ipAddress, date);
            } else {
                Long now = new Date().getTime();
                long diffSeconds = (now - date) / 1000 % 60;
                if (diffSeconds < 10) {
                    robot = true;
                    msg="Please try another 10 second.";
                }
                if (diffSeconds > 600) {
                    Long i = Long.parseLong("1");
                    request.getSession().setAttribute("times" + ipAddress, i);
                }
                request.getSession().setAttribute("time" + ipAddress, new Date().getTime());
            }
            Long i = (Long) request.getSession().getAttribute("times" + ipAddress);
            if (i == null) {
                i = Long.parseLong("1");
                request.getSession().setAttribute("times" + ipAddress, i);
            } else {
                if (robot) {
                    request.getSession().setAttribute("times" + ipAddress, i + 1);
                }
            }
            if (i >= 10) {
                robot = true;
                msg="Please try another 10 minutes.";
            }
        } catch (Exception e) {
        }
        if (robot) {
            out.print("You are robot. "+msg);
        } else {
            String inputx = "";
            try {
                if (type.equalsIgnoreCase("json")) {
                    String url = new CommonServices().getPropValues("kpu.properties", "verifikasiURL", request);
                    inputx = getWeb(url + nik);
                    JSONObject records = (JSONObject) JSONValue.parse(inputx);
                    out.print(JSONValue.toJSONString(records));
                } else {
                    out.print("{}");
                }
            } catch (Exception e) {
                inputx = "";
            }
            if (inputx.equalsIgnoreCase("")) {
                try {
                    if (type.equalsIgnoreCase("json")) {
                        String url = new CommonServices().getPropValues("kpu.properties", "verifikasiURL2015", request);
                        inputx = getWeb(url + nik);
                        LinkedHashMap records = getJsonNik(inputx);
                        out.print(JSONValue.toJSONString(records));
                    } else {
                        out.print("{}");
                    }
                } catch (Exception e) {
                    out.print("NIK tidak terdaftar");
                }
            }
        }
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
