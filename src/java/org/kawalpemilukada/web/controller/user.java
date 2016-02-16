/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.web.controller;

import com.google.gson.Gson;
import static com.googlecode.objectify.ObjectifyService.ofy;
import com.googlecode.objectify.cmd.Query;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONValue;
import org.kawalpemilukada.model.Pesan;
import org.kawalpemilukada.model.UserData;

/**
 *
 * @author khairulanshar
 */
public class user extends HttpServlet {

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
        String[] filters = request.getRequestURI().replace("/user/", "").split("/");
        String method = filters[0];
        int offset = Integer.parseInt(filters[1].toString());
        if (offset < 0) {
            offset = 0;
        }
        int limit = Integer.parseInt(filters[2].toString());
        if (limit > 100) {
            limit = 100;
        }

        LinkedHashMap record = new LinkedHashMap();
        Gson gson = new Gson();
        boolean isnotadmin = true;
        try {
            UserData user = CommonServices.getUser(request);
            if (user.userlevel > 10000) {
                isnotadmin = false;
            }
        } catch (Exception e) {
        }
        if (method.equalsIgnoreCase("getall")) {
            try {
                Query<UserData> query = ofy().load().type(UserData.class);
                query = query.order("-poin").limit(limit).offset(offset);
                List<UserData> userDatas = query.list();
                List<UserData> newuserDatas = new ArrayList<UserData>();
                for (UserData userData : userDatas) {
                    if (isnotadmin) {
                        userData.email = "";
                        userData.nokontak = "";
                        userData.uid="";
                        userData.uuid="";
                        userData.userlevel=0;
                    }
                    newuserDatas.add(userData);
                }
                record.put("user", JSONValue.parse(gson.toJson(newuserDatas)));
            } catch (Exception e) {
            }
        }
        PrintWriter out = response.getWriter();
        response.setContentType("text/html;charset=UTF-8");
        out.print(JSONValue.toJSONString(record));
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
