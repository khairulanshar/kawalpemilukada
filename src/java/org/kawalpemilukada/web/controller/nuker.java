/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.web.controller;

import com.googlecode.objectify.Key;
import static com.googlecode.objectify.ObjectifyService.ofy;
import java.io.IOException;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.kawalpemilukada.model.DataSuara;
import org.kawalpemilukada.model.StringKey;
import org.kawalpemilukada.model.UserData;
import static org.kawalpemilukada.web.controller.CommonServices.setParentId1;

/**
 *
 * @author khairulanshar
 */
public class nuker extends HttpServlet {

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
        String[] filters = request.getRequestURI().replace("/nuker/", "").split("/");
        String tahun = filters[0];
        String tingkat = filters[1];
        String kpuid = filters[2];
        getWilayah(tingkat, kpuid, tahun, kpuid);
    }

    private static void getWilayah(String tingkat, String kpuid, String tahun, String parentKpuid) {
        try {
            Key<StringKey> key = Key.create(StringKey.class, setParentId1(tingkat, tahun, kpuid));
            List<DataSuara> dataSuaras = ofy().load().type(DataSuara.class).ancestor(key).list();
            for (DataSuara dataSuara : dataSuaras) {
                try {

                    /*if ("59018".equalsIgnoreCase(parentKpuid)) {
                     Map<String, SuaraKandidat> suaraKandidat = dataSuara.suaraKandidat;
                     Map<String, SuaraKandidat> newsuaraKandidat = new HashMap<>();
                     newsuaraKandidat.put("1", suaraKandidat.get("1"));
                     if (suaraKandidat.get("2").nama.equalsIgnoreCase("dr. H. Jarot Winarno, M.Med.PH - Drs. Askiman, MM")) {
                     newsuaraKandidat.put("3", suaraKandidat.get("2"));
                     newsuaraKandidat.get("3").urut = Long.parseLong("3");
                     dataSuara.namas.set(2, suaraKandidat.get("2").nama);
                     } else {
                     newsuaraKandidat.put("3", suaraKandidat.get("3"));
                     }
                     if (suaraKandidat.get("3").nama.equalsIgnoreCase("Drs. Ignasius Juan, MM - Drs. H. Senen Maryono, M.Si")) {
                     newsuaraKandidat.put("2", suaraKandidat.get("3"));
                     newsuaraKandidat.get("2").urut = Long.parseLong("2");
                     dataSuara.namas.set(1, suaraKandidat.get("3").nama);
                     } else {
                     newsuaraKandidat.put("2", suaraKandidat.get("2"));
                     }

                     dataSuara.suaraKandidat = newsuaraKandidat;
                     ofy().save().entity(dataSuara).now();
                     }
                     if ("20923".equalsIgnoreCase(parentKpuid)) {
                     Map<String, SuaraKandidat> suaraKandidat = dataSuara.suaraKandidat;
                     Map<String, SuaraKandidat> newsuaraKandidat = new HashMap<>();
                     newsuaraKandidat.put("1", suaraKandidat.get("1"));
                     if (suaraKandidat.get("3").nama.equalsIgnoreCase("test 2")) {
                     newsuaraKandidat.put("5", suaraKandidat.get("3"));
                     newsuaraKandidat.get("5").urut = Long.parseLong("5");
                     dataSuara.namas.set(1, suaraKandidat.get("3").nama);
                     } else {
                     newsuaraKandidat.put("3", suaraKandidat.get("3"));
                     }
                     if (suaraKandidat.get("5").nama.equalsIgnoreCase("test 3")) {
                     newsuaraKandidat.put("3", suaraKandidat.get("5"));
                     newsuaraKandidat.get("3").urut = Long.parseLong("3");
                     dataSuara.namas.set(2, suaraKandidat.get("5").nama);
                     } else {
                     newsuaraKandidat.put("5", suaraKandidat.get("5"));
                     }
                     dataSuara.suaraKandidat = newsuaraKandidat;
                     ofy().save().entity(dataSuara).now();
                     }
                     if ("928070".equalsIgnoreCase(parentKpuid)) {
                     if (dataSuara.suaraKandidat.get("2").nama.equalsIgnoreCase("Drs. H.M SARIF HIDAYAT, MM - H. DEVI SUHARTONI")) {
                     dataSuara.suaraKandidat.get("2").nama = "KHAIRUL ALAMSYAH, SE - SITI NURIZKA PUTERI JAYA, SH. MH";
                     }
                     if (dataSuara.suaraKandidat.get("3").nama.equalsIgnoreCase("KHAIRUL ALAMSYAH, SE - SITI NURIZKA PUTERI JAYA, SH. MH")) {
                     dataSuara.suaraKandidat.get("3").nama = "Drs. H.M SARIF HIDAYAT, MM - H. DEVI SUHARTONI";
                     }
                     ofy().save().entity(dataSuara).now();
                     }
                     if ("10020".equalsIgnoreCase(parentKpuid)) {
                     if (dataSuara.suaraKandidat.get("1").nama.equalsIgnoreCase("Ir. DARWIN SIAGIAN, Ir. HULMAN SITORUS, MM")) {
                     dataSuara.suaraKandidat.get("1").nama = "Ir. DARWIN SIAGIAN - Ir. HULMAN SITORUS, MM";
                     }
                     if (dataSuara.suaraKandidat.get("2").nama.equalsIgnoreCase("Ir. POLTAK SITORUS - M.Sc, ROBINSON TAMPUBOLON, SH")) {
                     dataSuara.suaraKandidat.get("2").nama = "Ir. POLTAK SITORUS, M.Sc - ROBINSON TAMPUBOLON, SH";
                     }
                     if (dataSuara.suaraKandidat.get("3").nama.equalsIgnoreCase("Drs. MONANG SITORUS, SH, CHRISSIE SAGITA HUTAHAEAN")) {
                     dataSuara.suaraKandidat.get("3").nama = "Drs. MONANG SITORUS, SH - CHRISSIE SAGITA HUTAHAEAN";
                     }
                     ofy().save().entity(dataSuara).now();
                     }
                    if ("77578".equalsIgnoreCase(parentKpuid)) {
                        dataSuara.suaraKandidat.get("1").nama = "H. Amin Ahmad S.IP, MM - Jaya Lamusu, SP";
                        dataSuara.suaraKandidat.get("2").nama = "H. Ponsen Sarfa, ST. MM - Sagaf A. HI. Taha, S.Ag";
                        dataSuara.suaraKandidat.get("3").nama = "Rusihan Jafar, S.Pd - Drs. Paulus Beny Parengkuan";
                        dataSuara.suaraKandidat.get("4").nama = "Bahrain Kasuba - Iswan Hasjim ST, MT";
                        ofy().save().entity(dataSuara).now();
                    }
                    if ("928072".equalsIgnoreCase(parentKpuid)) {
                        dataSuara.suaraKandidat.get("1").nama = "Agustinus Klaran, ST - Paulus Seran Bauk, SH";
                        dataSuara.suaraKandidat.get("2").nama = "dr. Stefanus Bria Seran MPH - Drs. Daniel Asa";
                        dataSuara.suaraKandidat.get("3").nama = "Taolin Ludovikus, BA - Benny Chandradinata, SE";
                        ofy().save().entity(dataSuara).now();
                    }*/
                    if ("928079".equalsIgnoreCase(parentKpuid)) {
                        dataSuara.suaraKandidat.get("1").nama = "Aliong Mus, ST - Ramli";
                        dataSuara.suaraKandidat.get("2").nama = "H. Zainal Mus - Arifin H. Abd. Majid, SE, MT";
                        ofy().save().entity(dataSuara).now();
                    }

                    if (dataSuara.tingkat.equalsIgnoreCase("TPS")) {
                    } else {
                        getWilayah(tingkat, dataSuara.kpuid, tahun, parentKpuid);
                    }
                } catch (Exception ee) {
                    //System.out.println(dataSuara.nama +"==>"+ee.getMessage());
                }
            }
        } catch (Exception e) {
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
