/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.web.controller;

import com.googlecode.objectify.Key;
import static com.googlecode.objectify.ObjectifyService.ofy;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.kawalpemilukada.model.DataSuara;
import org.kawalpemilukada.model.KandidatWilayah;
import org.kawalpemilukada.model.StringKey;
import static org.kawalpemilukada.web.controller.CommonServices.getWebWithJson;
import static org.kawalpemilukada.web.controller.CommonServices.setParentId1;

/**
 *
 * @author khairulanshar
 */
public class cronocr extends HttpServlet {

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
        boolean isCronTask = "true".equals(request.getHeader("X-AppEngine-Cron"));
        if (!isCronTask) {
            return;
        }
        String[] filters = request.getRequestURI().replace("/cronocr/", "").split("/");
        String tahun = filters[0];
        String tingkat = filters[1];
        String result = "";
        //calling kawalc1 web service start here
        try {
            JSONObject jsonObject = null;
            JSONParser parser = new JSONParser();
            Object obj = parser.parse(new FileReader("dist/data/twopaslon.json"));
            jsonObject = (JSONObject) obj;
            result = getWebWithJson("http://kawalc1.org/custom.wsgi", JSONValue.toJSONString(jsonObject));
            System.out.println(result);
            if (result.length() > 0) {
                jsonObject = (JSONObject) JSONValue.parse(result);
                JSONArray input = (JSONArray) jsonObject.get("probabilityMatrix");

                JSONObject PASLON1 = null;
                JSONObject PASLON2 = null;
                JSONObject suarasah = null;
                JSONObject suaratidaksah = null;
                double confidencemac = Double.parseDouble("0");
                JSONArray input1 = new JSONArray();
                try {
                    input1 = (JSONArray) input.get(0);
                    for (int ii = 0; ii < input1.size(); ii++) {
                        JSONObject input2 = (JSONObject) input1.get(ii);
                        double confidence = Double.parseDouble(input2.get("confidence").toString());
                        int retval = Double.compare(confidence, confidencemac);
                        if (retval >= 0) {
                            confidencemac = confidence;
                            PASLON1 = (JSONObject) input2.get("0");
                            PASLON2 = (JSONObject) input2.get("1");
                            suarasah = (JSONObject) input2.get("2");
                        }
                    }
                    System.out.println("confidencemac: " + confidencemac);
                    System.out.println(PASLON1.get("displayName").toString() + ": " + PASLON1.get("number").toString());
                    System.out.println(PASLON2.get("displayName").toString() + ": " + PASLON2.get("number").toString());
                    System.out.println(suarasah.get("displayName").toString() + ": " + suarasah.get("number").toString());
                } catch (Exception e) {
                }

                try {
                    input1 = (JSONArray) input.get(1);
                    confidencemac = Double.parseDouble("0");
                    for (int ii = 0; ii < input1.size(); ii++) {
                        JSONObject input2 = (JSONObject) input1.get(ii);
                        double confidence = Double.parseDouble(input2.get("confidence").toString());
                        int retval = Double.compare(confidence, confidencemac);
                        if (retval >= 0) {
                            confidencemac = confidence;
                            suaratidaksah = (JSONObject) input2.get("3");
                        }
                    }
                    System.out.println("confidencemac: " + confidencemac);
                    System.out.println(suaratidaksah.get("displayName").toString() + ": " + suaratidaksah.get("number").toString());
                } catch (Exception e) {
                }

                /*jsonObject = (JSONObject) JSONValue.parse(result);
                 result = "";
                 result = getWebWithJson("http://kawalc1.org/extract.wsgi?configFile=" + jsonObject.get("configFile").toString() + "&filename=transformed%2f" + jsonObject.get("transformedUrl").toString(), "");

                 System.out.println(result);
                 jsonObject = (JSONObject) JSONValue.parse(result);
                 JSONArray input = (JSONArray) jsonObject.get("numbers");
                 for (int i = 0; i < input.size(); i++) {
                 JSONObject jsonObject2 = (JSONObject) input.get(i);
                 System.out.println(jsonObject2.get("").toString());
                 result = getWebWithJson(" http://kawalc1.org/processprobs.wsgi", JSONValue.toJSONString(jsonObject2));
                 System.out.println(result);
                 }*/
            }
        } catch (ParseException ex) {
            //Logger.getLogger(cronocr.class.getName()).log(Level.SEVERE, null, ex);
        }

        System.out.println(result);
        PrintWriter out = response.getWriter();
        response.setContentType("text/html;charset=UTF-8");
        out.print(result);
        out.flush();
        out.close();


        /*try {
         String tahun = filters[0];
         String tingkat = filters[1];
         List<KandidatWilayah> kandidatWilayahs = CommonServices.filterKandidatWilayah(tahun, tingkat, "", "");
         for (KandidatWilayah kandidatWilayah : kandidatWilayahs) {
         getWilayah(filters, kandidatWilayah.kpuid, kandidatWilayah, null);
         }
         } catch (Exception e) {
         }*/
    }

    private static void getWilayah(String[] filters, String kpuid, KandidatWilayah kandidatWilayah, DataSuara dataSuaraParent) {
        try {
            String tahun = filters[0];
            String tingkat = filters[1];
            Key<StringKey> key = Key.create(StringKey.class, setParentId1(tingkat, tahun, kpuid));
            List<DataSuara> dataSuaras = ofy().load().type(DataSuara.class).ancestor(key).list();
            for (DataSuara dataSuara : dataSuaras) {
                try {
                    if (dataSuara.tingkat.equalsIgnoreCase("TPS")) {
                        if (dataSuara.sudahDiloadDariKawalC1.equalsIgnoreCase("N")
                                && (!dataSuara.dilock.equalsIgnoreCase("Y"))) {
                            System.out.println(dataSuaraParent.tingkat + " ==> " + dataSuaraParent.nama + " ==> " + dataSuara.tingkat + " ==> " + dataSuara.nama);
                            //calling kawalc1 web service start here
                            JSONObject jsonObject = null;
                            JSONParser parser = new JSONParser();
                            if (dataSuara.uruts.size() == 2) {
                                Object obj = parser.parse(new FileReader("dist/data/twopaslon.json"));
                                jsonObject = (JSONObject) obj;
                            }
                        }
                    } else {
                        getWilayah(filters, dataSuara.kpuid, kandidatWilayah, dataSuara);
                    }
                } catch (Exception ee) {
                }
            }
        } catch (Exception e) {
        }
    }

    private static String getWeb(String endpoint) throws IOException {
        String output = "";
        URL url;
        try {
            url = new URL(endpoint);
        } catch (MalformedURLException e) {
            throw new IllegalArgumentException("invalid url: " + endpoint);
        }
        String body = "";
        HttpURLConnection conn = null;
        try {
            conn = (HttpURLConnection) url.openConnection();
            conn.setDoOutput(true);
            conn.setDoInput(true);
            conn.setUseCaches(false);
            conn.setFixedLengthStreamingMode(body.getBytes().length);
            conn.setRequestMethod("GET");
            conn.connect();
            // handle the response
            int status = conn.getResponseCode();
            if (status != 200) {
                //System.out.println("Post failed with error code " + status);
            } else {
                try {
                    BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder sb1 = new StringBuilder();
                    String read = br.readLine();
                    while (read != null) {
                        sb1.append(read);
                        read = br.readLine();
                    }
                    output = sb1.toString();

                } catch (Exception e) {
                }
            }
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
        return output;
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

    private String getWeb(String httpkawalc1orgcustomwsgi, String toJSONString) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

}
