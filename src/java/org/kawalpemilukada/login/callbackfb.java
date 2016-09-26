/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.login;

import org.kawalpemilukada.web.controller.CommonServices;
import com.google.gson.Gson;
import static com.googlecode.objectify.ObjectifyService.ofy;
import facebook4j.Facebook;
import facebook4j.FacebookException;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONValue;
import org.kawalpemilukada.model.Dashboard;
import org.kawalpemilukada.model.UserData;

/**
 *
 * @author khairulanshar
 */
public class callbackfb extends HttpServlet {

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

        Facebook facebook = (Facebook) request.getSession().getAttribute("facebook");
        String oauthCode = request.getParameter("code");
        try {
            facebook.getOAuthAccessToken(oauthCode);
        } catch (FacebookException e) {
            throw new ServletException(e);
        }
        request.getSession().setAttribute("facebook", facebook);
        String errorMsg = "Data Anda belum terverifikasi.";
        UserData user = null;
        Dashboard dashboard = CommonServices.getDashboard(CommonServices.setParentId("2015", "0"));
        Dashboard dashboard2014 = CommonServices.getDashboard(CommonServices.setParentId("2014", "0"));
        request.getSession().removeAttribute("tahun");
        try {
            facebook4j.User u = facebook.getMe();
            user = ofy().load().type(UserData.class).id("fb" + CommonServices.getVal(u.getId())).now();
            if (user == null) {
                user = new UserData("fb" + CommonServices.getVal(u.getId()));
                user.imgurl = "https://graph.facebook.com/" + u.getId() + "/picture";
                user.nama = CommonServices.getVal(u.getName());
                user.link = CommonServices.getVal(u.getLink());
                user.email = CommonServices.getVal(u.getEmail());
                user.type = "fb";
                user.userlevel = 100;
                user.terverifikasi = "Y";
                ofy().save().entity(user).now();
                dashboard.users = CommonServices.getuserSize() + "";
                ofy().save().entity(dashboard).now();
                dashboard2014.users = dashboard.users + "";
                ofy().save().entity(dashboard2014).now();
            } else {
                user.lastlogin = CommonServices.JakartaTime();
                user.type = "fb";
                user.imgurl = "https://graph.facebook.com/" + u.getId() + "/picture";
                if (user.type.equalsIgnoreCase("fb") && user.nama.equalsIgnoreCase(CommonServices.getVal(u.getName()))) {
                    if (user.terverifikasi.equalsIgnoreCase("Y")) {
                        errorMsg = "";
                    }
                } else {
                    user.nama = CommonServices.getVal(u.getName());
                    user.terverifikasi = "N";
                }
                ofy().save().entity(user).now();
            }
            Gson gson = new Gson();
            request.getSession().setAttribute("UserData", JSONValue.parse(gson.toJson(user)));
        } catch (Exception e) {
            errorMsg = "callbackfb [processRequest] ==> " + e.toString();
        }
        response.setContentType("text/html;charset=UTF-8");
        Gson gson = new Gson();
        try (PrintWriter out = response.getWriter()) {
            /* TODO output your page here. You may use following sample code. */
            out.println("<!DOCTYPE html>");
            out.println("<html>");
            out.println("<head>");
            out.println("<title>Kawal Pemilu Kepala Daerah</title>");
            out.println("<script src=\"/bower_components/jquery/dist/jquery.min.js\"></script>");
            out.println("<script src=\"/dist/js/vendor.js\"></script>");
            out.println("</head>");
            out.println("<body>Sedang Login...");
            out.println("<script>");
            out.println("if (!jQuery.browser.mobile) {");
            out.println("try{window.opener.inviteCallback(" + gson.toJson(user) + "," + gson.toJson(dashboard) + ",'" + errorMsg + "');}catch(e){window.location='/'}");
            out.println("self.close();");
            out.println("}else{window.location='/'}");
            out.println("</script>");
            out.println("</body>");
            out.println("</html>");
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

}
