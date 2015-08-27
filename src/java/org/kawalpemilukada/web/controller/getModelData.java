/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.web.controller;

//import com.google.common.reflect.TypeToken;
import com.google.gson.Gson;
import static com.googlecode.objectify.ObjectifyService.ofy;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
//import java.lang.reflect.Type;
import java.util.LinkedHashMap;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.kawalpemilukada.model.Dashboard;
import org.kawalpemilukada.model.UserData;

/**
 *
 * @author khairulanshar
 */
public class getModelData extends HttpServlet {

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
            throws ServletException, IOException, ClassNotFoundException {
        String form_action = request.getParameter("form_action");
        if (form_action == null) {
            form_action = "";
        }
        PrintWriter out = response.getWriter();
        response.setContentType("text/html;charset=UTF-8");
        LinkedHashMap record = new LinkedHashMap();
        Gson gson = new Gson();
        if (form_action.equalsIgnoreCase("getDashboard")) {
            String tahun = request.getParameter("tahun");
            if (tahun == null) {
                tahun = "";
            }
            Dashboard dashboard = CommonServices.getDashboard(CommonServices.setParentId(tahun, "0"));
            record.put("dashboard", JSONValue.parse(gson.toJson(dashboard)));
        }
        if (form_action.equalsIgnoreCase("getNumberUser")) {
            String tahun = request.getParameter("tahun");
            if (tahun == null) {
                tahun = "";
            }
            UserData user = CommonServices.getUser(request);
            if (user.userlevel < 1000) {
                return;
            }
            Dashboard dashboard = CommonServices.getDashboard(CommonServices.setParentId(tahun, "0"));
            dashboard.users = CommonServices.getuserSize() + "";
            ofy().save().entity(dashboard).now();
            record.put("dashboard", JSONValue.parse(gson.toJson(dashboard)));
        }
        if (form_action.equalsIgnoreCase("updateUser")) {
            StringBuilder sb = new StringBuilder();
            String line = null;
            BufferedReader reader = request.getReader();
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            JSONObject input = (JSONObject) JSONValue.parse(sb.toString());
            try {
                UserData user = CommonServices.getUser(request);
                if (user.uid.toString().length() > 0 && user.terverifikasi.equalsIgnoreCase("Y")) {
                    if (input.get("uid").toString().equalsIgnoreCase(user.uid.toString())) {
                        if (input.get("kabkota").toString().length() > 0) {
                            user.kabkota = input.get("kabkota").toString();
                            user.kabkotaId = input.get("kabkotaId").toString();
                        }
                        if (input.get("desa").toString().length() > 0) {
                            user.desa = input.get("desa").toString();
                            user.desaId = input.get("desaId").toString();
                        }
                        if (input.get("kecamatan").toString().length() > 0) {
                            user.kecamatan = input.get("kecamatan").toString();
                            user.kecamatanId = input.get("kecamatanId").toString();
                        }
                        if (input.get("provinsi").toString().length() > 0) {
                            user.provinsi = input.get("provinsi").toString();
                            user.provinsiId = input.get("provinsiId").toString();
                        }
                        if (input.get("email").toString().length() > 0) {
                            user.email = input.get("email").toString();
                        }
                        if (input.get("nokontak").toString().length() > 0) {
                            user.nokontak = input.get("nokontak").toString();
                        }
                        if (input.get("userlevel").toString().length() > 0) {
                            if (Integer.parseInt(input.get("userlevel").toString()) > 200) {
                                user.userlevel = 0;
                            } else {
                                user.userlevel = Integer.parseInt(input.get("userlevel").toString());
                            }
                        }
                        ofy().save().entity(user).now();
                        record.put("user", JSONValue.parse(gson.toJson(user)));
                    }
                }
            } catch (Exception e) {
                record.put("errormsg", e.toString());
            }
        }
        out.print(JSONValue.toJSONString(record));
        out.flush();
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
        } catch (ClassNotFoundException ex) {
            //Logger.getLogger(getModelData.class.getName()).log(Level.SEVERE, null, ex);
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
        } catch (ClassNotFoundException ex) {
            //Logger.getLogger(getModelData.class.getName()).log(Level.SEVERE, null, ex);
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
