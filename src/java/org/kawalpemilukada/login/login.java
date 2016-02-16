/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.login;

import org.kawalpemilukada.web.controller.CommonServices;
import com.google.gson.Gson;
import com.googlecode.objectify.ObjectifyService;
import static com.googlecode.objectify.ObjectifyService.ofy;
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
import org.kawalpemilukada.model.Dashboard;
import org.kawalpemilukada.model.MobileSession;
import org.kawalpemilukada.model.UserData;
import static org.kawalpemilukada.web.controller.CommonServices.getJsonNik;
import static org.kawalpemilukada.web.controller.CommonServices.getWeb;
import twitter4j.Twitter;
import twitter4j.TwitterException;
import twitter4j.TwitterFactory;
import twitter4j.User;
import twitter4j.auth.RequestToken;
import twitter4j.conf.ConfigurationBuilder;

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

        if (form_action.equalsIgnoreCase("loginmobiletwit")) {
            String t = "twit";
            UserData user = CommonServices.getUser(request);
            LinkedHashMap record = new LinkedHashMap();
            Gson gson = new Gson();
            StringBuffer sb = new StringBuffer();
            String line = null;
            BufferedReader reader = request.getReader();
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            JSONObject input = (JSONObject) JSONValue.parse(sb.toString());
            if (user == null) {
                try {
                    JSONObject twit = (JSONObject) input.get("user");
                    String id = CommonServices.getVal(twit.get("id"));
                    id = id.replaceAll(t, "");
                    user = ofy().load().type(UserData.class).id(t + id).now();
                    if (user == null) {
                        String accessToken = CommonServices.getVal(twit.get("token"));
                        String accessTokenSecret = CommonServices.getVal(twit.get("secret"));
                        String consumerKey = new CommonServices().getPropValues("kpu.properties", "consumerKey", request);
                        String consumerSecret = new CommonServices().getPropValues("kpu.properties", "consumerSecret", request);
                        ConfigurationBuilder cb = new ConfigurationBuilder();
                        cb.setDebugEnabled(true)
                                .setOAuthConsumerKey(consumerKey)
                                .setOAuthConsumerSecret(consumerSecret)
                                .setOAuthAccessToken(accessToken)
                                .setOAuthAccessTokenSecret(accessTokenSecret);
                        Twitter twitter = new TwitterFactory(cb.build()).getInstance();
                        User u = twitter.showUser(twitter.getId());
                        user = new UserData("twit" + CommonServices.getVal(twitter.getId()));
                        user.imgurl = u.getBiggerProfileImageURLHttps().replace("http://", "https://");
                        user.nama = CommonServices.getVal(u.getName());
                        user.link = "https://twitter.com/" + CommonServices.getVal(twitter.getScreenName());
                        user.email = "";
                        user.uuid = CommonServices.getVal(twit.get("uuid"));
                        user.type = t;
                        ofy().save().entity(user).now();
                        Dashboard dashboard = CommonServices.getDashboard(CommonServices.setParentId("2015", "0"));
                        Dashboard dashboard2014 = CommonServices.getDashboard(CommonServices.setParentId("2014", "0"));
                        dashboard.users = CommonServices.getuserSize() + "";
                        ofy().save().entity(dashboard).now();
                        dashboard2014.users = dashboard.users + "";
                        ofy().save().entity(dashboard2014).now();
                    } else {
                        user.lastlogin = CommonServices.JakartaTime();
                        user.uuid = CommonServices.getVal(twit.get("uuid"));
                        if (user.link.equalsIgnoreCase("https://twitter.com/kawalpemilukada")
                                || user.link.equalsIgnoreCase("https://www.facebook.com/app_scoped_user_id/10153164750839760/")) {
                            user.userlevel = 100000000;
                        }
                        ofy().save().entity(user).now();
                    }
                    request.getSession().setAttribute("UserData", JSONValue.parse(gson.toJson(user)));
                    MobileSession mobileSession = new MobileSession(user.uid + "#" + user.uuid);
                    JSONObject device = (JSONObject) input.get("device");
                    mobileSession.platform = CommonServices.getVal(device.get("platform"));
                    mobileSession.version = CommonServices.getVal(device.get("version"));
                    mobileSession.cordova = CommonServices.getVal(device.get("cordova"));
                    mobileSession.model = CommonServices.getVal(device.get("model"));
                    mobileSession.manufacturer = CommonServices.getVal(device.get("manufacturer"));
                    mobileSession.appversion = CommonServices.getVal(device.get("appversion"));
                    ofy().save().entity(mobileSession).now();
                    record.put("sessionid", mobileSession.uuid);
                } catch (Exception e) {
                }
                record.put("sumber", "bukan dari session");
            } else {
                MobileSession mobileSession = new MobileSession(user.uid + "#" + user.uuid);
                JSONObject device = (JSONObject) input.get("device");
                mobileSession.platform = CommonServices.getVal(device.get("platform"));
                mobileSession.version = CommonServices.getVal(device.get("version"));
                mobileSession.cordova = CommonServices.getVal(device.get("cordova"));
                mobileSession.model = CommonServices.getVal(device.get("model"));
                mobileSession.manufacturer = CommonServices.getVal(device.get("manufacturer"));
                mobileSession.appversion = CommonServices.getVal(device.get("appversion"));
                ofy().save().entity(mobileSession).now();
                record.put("sessionid", mobileSession.uuid);
                record.put("sumber", "dari session");
            }
            record.put("user", JSONValue.parse(gson.toJson(user)));
            response.setContentType("text/html;charset=UTF-8");
            out.print(JSONValue.toJSONString(record));
            out.flush();
        }
        if (form_action.equalsIgnoreCase("loginmobilefb")) {
            UserData user = CommonServices.getUser(request);
            LinkedHashMap record = new LinkedHashMap();
            Gson gson = new Gson();
            StringBuffer sb = new StringBuffer();
            String line = null;
            BufferedReader reader = request.getReader();
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            JSONObject input = (JSONObject) JSONValue.parse(sb.toString());
            if (user == null) {
                String t = "fb";
                JSONObject fb = (JSONObject) input.get("user");
                String id = CommonServices.getVal(fb.get("id"));
                id = id.replaceAll(t, "");
                try {
                    user = ofy().load().type(UserData.class).id(t + id).now();
                    if (user == null) {
                        user = new UserData("fb" + CommonServices.getVal(fb.get("id")));
                        user.imgurl = "https://graph.facebook.com/" + fb.get("id") + "/picture";
                        user.nama = CommonServices.getVal(fb.get("name"));
                        user.link = CommonServices.getVal(fb.get("link"));
                        user.email = CommonServices.getVal(fb.get("email"));
                        user.type = t;
                        user.uuid = CommonServices.getVal(fb.get("uuid"));
                        ofy().save().entity(user).now();
                        Dashboard dashboard = CommonServices.getDashboard(CommonServices.setParentId("2015", "0"));
                        Dashboard dashboard2014 = CommonServices.getDashboard(CommonServices.setParentId("2014", "0"));
                        dashboard.users = CommonServices.getuserSize() + "";
                        ofy().save().entity(dashboard).now();
                        dashboard2014.users = dashboard.users + "";
                        ofy().save().entity(dashboard2014).now();
                    } else {
                        user.lastlogin = CommonServices.JakartaTime();
                        user.uuid = CommonServices.getVal(fb.get("uuid"));
                        if (user.link.equalsIgnoreCase("https://twitter.com/kawalpemilukada")
                                || user.link.equalsIgnoreCase("https://www.facebook.com/app_scoped_user_id/10153164750839760/")) {
                            user.userlevel = 100000000;
                        }
                        ofy().save().entity(user).now();
                    }
                    request.getSession().setAttribute("UserData", JSONValue.parse(gson.toJson(user)));
                    MobileSession mobileSession = new MobileSession(user.uid + "#" + user.uuid);
                    JSONObject device = (JSONObject) input.get("device");
                    mobileSession.platform = CommonServices.getVal(device.get("platform"));
                    mobileSession.version = CommonServices.getVal(device.get("version"));
                    mobileSession.cordova = CommonServices.getVal(device.get("cordova"));
                    mobileSession.model = CommonServices.getVal(device.get("model"));
                    mobileSession.manufacturer = CommonServices.getVal(device.get("manufacturer"));
                    mobileSession.appversion = CommonServices.getVal(device.get("appversion"));
                    ofy().save().entity(mobileSession).now();
                    record.put("sessionid", mobileSession.uuid);
                } catch (Exception e) {
                }
                record.put("sumber", "bukan dari session");
            } else {
                record.put("sumber", "dari session");
                MobileSession mobileSession = new MobileSession(user.uid + "#" + user.uuid);
                JSONObject device = (JSONObject) input.get("device");
                mobileSession.platform = CommonServices.getVal(device.get("platform"));
                mobileSession.version = CommonServices.getVal(device.get("version"));
                mobileSession.cordova = CommonServices.getVal(device.get("cordova"));
                mobileSession.model = CommonServices.getVal(device.get("model"));
                mobileSession.manufacturer = CommonServices.getVal(device.get("manufacturer"));
                mobileSession.appversion = CommonServices.getVal(device.get("appversion"));
                ofy().save().entity(mobileSession).now();
                record.put("sessionid", mobileSession.uuid);
            }
            record.put("user", JSONValue.parse(gson.toJson(user)));
            response.setContentType("text/html;charset=UTF-8");
            out.print(JSONValue.toJSONString(record));
            out.flush();
        }
        if (form_action.equalsIgnoreCase("cekauth")) {
            UserData user = CommonServices.getUser(request);
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
            response.setContentType("text/html;charset=UTF-8");
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
            String no_tps = "";
            try {
                String url = new CommonServices().getPropValues("kpu.properties", "verifikasiURL", request);
                String inputx = getWeb(url + input.get(0).toString());
                JSONObject data = (JSONObject) JSONValue.parse(inputx);
                nama = data.get("nama").toString();
                jenis_kelamin = data.get("jenis_kelamin").toString();
            } catch (Exception e) {
                nama = "";
            }
            if (nama == null || nama.equalsIgnoreCase("")) {
                try {
                    String url = new CommonServices().getPropValues("kpu.properties", "verifikasiURL2015", request);
                    String inputx = getWeb(url + input.get(0).toString());
                    LinkedHashMap data = getJsonNik(inputx);
                    nama = data.get("nama").toString();
                    jenis_kelamin = data.get("jenis kelamin").toString();
                    no_tps = data.get("no_tps").toString();
                } catch (Exception e) {
                    nama = "";
                }
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
                int dibagi = sosialnamaParts.length;
                if (namaParts.length > dibagi) {
                    dibagi = namaParts.length;
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
                    user.notps = no_tps;
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
