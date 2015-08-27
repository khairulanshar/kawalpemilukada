/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.login;

import org.kawalpemilukada.web.controller.CommonServices;
import com.google.gson.Gson;
import com.googlecode.objectify.ObjectifyService;
import facebook4j.Facebook;
import facebook4j.FacebookFactory;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.LinkedHashMap;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.kawalpemilukada.model.UserData;
import twitter4j.Twitter;
import twitter4j.TwitterException;
import twitter4j.TwitterFactory;
import twitter4j.auth.RequestToken;

/**
 *
 * @author khairulanshar
 */
public class login extends HttpServlet {

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
        String form_action = request.getParameter("form_action");
        if (form_action == null) {
            form_action = "";
        }
        PrintWriter out = response.getWriter();
        if (form_action.equalsIgnoreCase("loginfb")) {
            String tahun = request.getParameter("tahun");
            if (tahun == null) {
                tahun = "";
            }
            Facebook facebook = new FacebookFactory().getInstance();
            request.getSession().setAttribute("facebook", facebook);
            request.getSession().setAttribute("tahun", tahun);
            StringBuffer callbackURL = request.getRequestURL();
            int index = callbackURL.lastIndexOf("/");
            callbackURL.replace(index, callbackURL.length(), "").append("/callbackfb");
            response.sendRedirect(facebook.getOAuthAuthorizationURL(callbackURL.toString()) + "&display=popup");
        }
        if (form_action.equalsIgnoreCase("logintwit")) {
            String tahun = request.getParameter("tahun");
            if (tahun == null) {
                tahun = "";
            }
            Twitter twitter = new TwitterFactory().getInstance();
            request.getSession().setAttribute("twitter", twitter);
            request.getSession().setAttribute("tahun", tahun);
            String rurl = request.getParameter("rurl");
            StringBuffer callbackURL = request.getRequestURL();
            int index = callbackURL.lastIndexOf("/");
            callbackURL.replace(index, callbackURL.length(), "").append("/callbackTwit?rurl=" + rurl);
            try {
                RequestToken requestToken = twitter.getOAuthRequestToken(callbackURL.toString());
                request.getSession().setAttribute("requestToken", requestToken);
                response.sendRedirect(requestToken.getAuthenticationURL());
            } catch (TwitterException e) {
                request.getSession().removeAttribute("twitter");
                request.getSession().removeAttribute("tahun");
            }
        }
        if (form_action.equalsIgnoreCase("cekauth")) {
            UserData user = CommonServices.getUser(request);
            response.setContentType("text/html;charset=UTF-8");
            LinkedHashMap record = new LinkedHashMap();
            Gson gson = new Gson();
            if (user == null) {
                record.put("status", "belum login");
            } else {
                record.put("user", JSONValue.parse(gson.toJson(user)));
                if (user.terverifikasi.equalsIgnoreCase("Y")) {
                    record.put("status", "terverifikasi");
                } else {
                    record.put("status", "Data Anda belum terverifikasi.");
                }
            }
            out.print(JSONValue.toJSONString(record));
            out.flush();
        }
        if (form_action.equalsIgnoreCase("verifikasi")) {
            LinkedHashMap record = new LinkedHashMap();
            StringBuffer sb = new StringBuffer();
            String line = null;
            BufferedReader reader = request.getReader();
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            JSONArray input = (JSONArray) JSONValue.parse(sb.toString());
            String nama = "";
            String jenis_kelamin = "";
            try {
                String url=new CommonServices().getPropValues("kpu.properties","verifikasiURL",request);
                JSONObject data = CommonServices.post(null, url + input.get(0).toString(), "GET");
                nama = data.get("nama").toString();
                jenis_kelamin=  data.get("jenis_kelamin").toString();
            } catch (Exception e) {
                nama = "";
            }
            JSONArray matchs = new JSONArray();
            if (nama.equalsIgnoreCase(input.get(1).toString())) {
                UserData user = CommonServices.getUser(request);
                double match = 0;
                //if (data.get("nama").toString().equalsIgnoreCase(user.nama)) {
                //match = 100;
                //} else {
                String[] sosialnamaParts = user.nama.toString().split(" ");
                String[] namaParts = nama.toString().split(" ");
                int dibagi=sosialnamaParts.length;
                if (namaParts.length>dibagi){
                    dibagi=namaParts.length;
                }
                double increase = 100 / dibagi;
                String iiString = "";
                for (int i = 0; i < namaParts.length; i++) {
                    String namaPart = namaParts[i];
                    for (int ii = 0; ii < sosialnamaParts.length; ii++) {
                        String fbnamaPart = sosialnamaParts[ii];
                        if (namaPart.equalsIgnoreCase(fbnamaPart) && (!iiString.contains(ii + ""))) {
                            match = match + increase;
                            matchs.add(namaPart + " sesuai dengan " + fbnamaPart);
                            iiString = iiString + "[" + ii + "]";
                            break;
                        }
                    }
                }
                // }
                if (match > 100) {
                    match = 100;
                }
                if (match >= 60) {
                    user.terverifikasi = "Y";
                    ObjectifyService.ofy().save().entity(user).now();
                    Gson gson = new Gson();
                    record.put("user", JSONValue.parse(gson.toJson(user)));
                } 
                record.put("status", match + "");
                record.put("matchs", matchs);
            } else {
                record.put("status", "Data NIK: " + input.get(0).toString() + " dan Nama: " + input.get(1).toString() + " tidak ditemukan.");
            }
            response.setContentType("text/html;charset=UTF-8");
            out.print(JSONValue.toJSONString(record));
            out.flush();
        }
    }

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
