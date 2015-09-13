/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.web.controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.URL;
import java.net.URLConnection;
import java.text.ParseException;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import static org.kawalpemilukada.web.controller.CommonServices.JakartaTime;
import twitter4j.Query;
import twitter4j.QueryResult;
import twitter4j.Status;
import twitter4j.Twitter;
import twitter4j.TwitterException;
import twitter4j.TwitterFactory;
import twitter4j.conf.ConfigurationBuilder;

/**
 *
 * @author khairulanshar
 */
public class SentimentAnalysis extends HttpServlet {

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
        JSONArray returnVals = new JSONArray();
        /*try {
            StringBuilder sb = new StringBuilder();
            String line = null;
            BufferedReader reader = request.getReader();
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            JSONArray input = (JSONArray) JSONValue.parse(sb.toString());
            String topic = input.get(0).toString();
            String[] topics = topic.split(" ");
        } catch (Exception te) {
        }*/
        try {
            String[] filters = request.getRequestURI().replace("/sentimentanalysis/", "").split("/");
            URL url = new URL(
                    "https://ajax.googleapis.com/ajax/services/search/web?v=1.0&oe=utf8&ie=utf8&source=uds&start=" + filters[1] + "&hl=en&q=" + filters[0] + "&userip=");
            URLConnection connection = url.openConnection();
            connection.addRequestProperty("Referer", "https://www.kawalpilkada.id");

            String line = "";
            StringBuilder builder = new StringBuilder();
            BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            while ((line = reader.readLine()) != null) {
                builder.append(line);
            }
            JSONObject json = (JSONObject) JSONValue.parse(builder.toString());
            JSONObject responseData = (JSONObject) json.get("responseData");
            returnVals.add(responseData.get("results"));
            returnVals.add(responseData.get("cursor"));
            /*String accessToken = new CommonServices().getPropValues("kpu.properties", "accessToken", request);
             String accessTokenSecret = new CommonServices().getPropValues("kpu.properties", "accessTokenSecret", request);
             String consumerKey = new CommonServices().getPropValues("kpu.properties", "consumerKey", request);
             String consumerSecret = new CommonServices().getPropValues("kpu.properties", "consumerSecret", request);
             ConfigurationBuilder cb = new ConfigurationBuilder();
             cb.setDebugEnabled(true)
             .setOAuthConsumerKey(consumerKey)
             .setOAuthConsumerSecret(consumerSecret)
             .setOAuthAccessToken(accessToken)
             .setOAuthAccessTokenSecret(accessTokenSecret);

             Twitter twitter = new TwitterFactory(cb.build()).getInstance();
             cariText(returnVals, twitter, filters[0]);
             for (int i = 1; i < topics.length; i++) {
             cariText(returnVals, twitter, topics[i]);
             }*/
        } catch (Exception e) {
        }
        PrintWriter out = response.getWriter();
        response.setContentType("text/html;charset=UTF-8");
        out.print(JSONValue.toJSONString(returnVals));
        out.flush();
        out.close();
    }

    private void cariText(JSONArray returnVals, Twitter twitter, String topic) throws ParseException {
        try {
            Query query = new Query(topic);
            query.setCount(100);
            QueryResult result;
            do {
                result = twitter.search(query);
                List<Status> tweets = result.getTweets();
                for (Status tweet : tweets) {
                    JSONObject returnVal = new JSONObject();
                    returnVal.put("Text", tweet.getText());
                    //returnVal.put("HashtagEntities", tweet.getHashtagEntities().toString());
                    //returnVal.put("UserMentionEntities", tweet.getUserMentionEntities().toString());
                    returnVal.put("FavoriteCount", tweet.getFavoriteCount());
                    returnVal.put("RetweetCount", tweet.getRetweetCount());
                    returnVal.put("UserImg", tweet.getUser().getBiggerProfileImageURLHttps().toString());
                    returnVal.put("UserLink", "https://twitter.com/" + CommonServices.getVal(tweet.getUser().getScreenName()));
                    returnVal.put("CreatedAt", JakartaTime(tweet.getCreatedAt()).toString());
                    returnVals.add(returnVal);
                }
            } while ((query = result.nextQuery()) != null);
        } catch (TwitterException te) {
            te.printStackTrace();
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
