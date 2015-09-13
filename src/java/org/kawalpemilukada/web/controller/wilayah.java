/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.web.controller;

import com.google.gson.Gson;
import static com.googlecode.objectify.ObjectifyService.ofy;
import com.googlecode.objectify.cmd.QueryKeys;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONArray;
import org.json.simple.JSONValue;
import org.kawalpemilukada.model.Dashboard;
import org.kawalpemilukada.model.UserData;
import org.kawalpemilukada.model.Wilayah;

/**
 *
 * @author khairulanshar
 */
public class wilayah extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        JSONArray wilayahs = new JSONArray();
        try {
            String[] filters = request.getRequestURI().replace("/wilayah/", "").split("/");
            String tahun = filters[0];
            String filterby = filters[1];
            if (filterby.equalsIgnoreCase("setup")) {
                try {
                    UserData user = CommonServices.getUser(request);
                    if (user.uid.toString().length() > 0 && user.userlevel >= 1000) {
                        CommonServices.createWilayah(filters);
                        wilayahs.add("Completed");
                    }
                } catch (Exception e) {
                }
            } else if (filterby.equalsIgnoreCase("loadProvinsi")) {
                try {
                    UserData user = CommonServices.getUser(request);
                    if (user.uid.toString().length() > 0 && user.userlevel >= 1000) {
                        Dashboard dashboard = CommonServices.getDashboard(CommonServices.setParentId(tahun, "0"));
                        CommonServices.loadProvisnsi(dashboard, tahun);
                        wilayahs.add("Completed");
                    }
                } catch (Exception e) {
                }
            } else if (filterby.equalsIgnoreCase("loadKabupaten")) {
                try {
                    UserData user = CommonServices.getUser(request);
                    if (user.uid.toString().length() > 0 && user.userlevel >= 1000) {
                        Dashboard dashboard = CommonServices.getDashboard(CommonServices.setParentId(tahun, "0"));
                        CommonServices.loadKabupaten(dashboard, tahun);
                        wilayahs.add("Completed");
                    }
                } catch (Exception e) {
                }
            } else if (filterby.equalsIgnoreCase("setKecamatan")) {
                try {
                    UserData user = CommonServices.getUser(request);
                    if (user.uid.toString().length() > 0 && user.userlevel >= 1000) {
                        Dashboard dashboard = CommonServices.getDashboard(CommonServices.setParentId(tahun, "0"));
                        CommonServices.loadKecamatan(request, dashboard, tahun);
                        wilayahs.add("Completed");
                    }
                } catch (Exception e) {
                }
            } else if (filterby.equalsIgnoreCase("setKelurahan")) {
                try {
                    UserData user = CommonServices.getUser(request);
                    if (user.uid.toString().length() > 0 && user.userlevel >= 1000) {
                        Dashboard dashboard = CommonServices.getDashboard(CommonServices.setParentId(tahun, "0"));
                        CommonServices.loadDesa(request, dashboard, tahun);
                        wilayahs.add("Completed");
                    }
                } catch (Exception e) {
                }
            } else if (filterby.equalsIgnoreCase("setTPS")) {
                try {
                    UserData user = CommonServices.getUser(request);
                    if (user.uid.toString().length() > 0 && user.userlevel >= 1000) {
                        Dashboard dashboard = CommonServices.getDashboard(CommonServices.setParentId(tahun, "0"));
                        String no = filters[2];
                        CommonServices.loadTPS(request, dashboard, tahun, "-" + no);
                        wilayahs.add("Completed");
                    }
                } catch (Exception e) {
                }
            } else if (filterby.equalsIgnoreCase("hitung")) {
                try {
                    UserData user = CommonServices.getUser(request);
                    if (user.uid.toString().length() > 0 && user.userlevel >= 1000) {
                        String filterBy = filters[2];
                        String filter = filters[3];
                        QueryKeys<Wilayah> query = ofy()
                                .load()
                                .type(Wilayah.class).filter(filterBy, filter).filter("tahun", tahun).keys();
                        int jumlah = query.list().size();
                        Dashboard dashboard = CommonServices.getDashboard(CommonServices.setParentId(tahun, "0"));
                        if (filter.equalsIgnoreCase(CommonServices.tingkat1)) {
                            dashboard.provinsi = jumlah + "";
                        }
                        if (filter.equalsIgnoreCase(CommonServices.tingkat2)) {
                            dashboard.kabupaten = jumlah + "";
                        }
                        if (filter.equalsIgnoreCase(CommonServices.tingkat3)) {
                            dashboard.kecamatan = jumlah + "";
                        }
                        if (filter.equalsIgnoreCase(CommonServices.tingkat4)) {
                            dashboard.desa = jumlah + "";
                        }
                        if (filter.equalsIgnoreCase(CommonServices.tingkat5)) {
                            dashboard.TPS = jumlah + "";
                        }
                        ofy().save().entity(dashboard).now();
                        wilayahs.add("Completed jumlah:" + jumlah);
                    }
                } catch (Exception e) {
                }
            } else {
                Gson gson = new Gson();
                if (filterby.equalsIgnoreCase("kpuid") || filterby.equalsIgnoreCase("nama") || filterby.equalsIgnoreCase("tingkat")) {
                    String parentId = filters[2];
                    String filter = filters[3];
                    List<Wilayah> wilayah = CommonServices.filterWilayah(tahun, parentId, filterby, filter);
                    wilayahs.add(JSONValue.parse(gson.toJson(wilayah)));
                } else {
                    String parentId = filterby;
                    List<Wilayah> wilayah = CommonServices.filterWilayah(tahun, parentId, "", "");
                    wilayahs.add(JSONValue.parse(gson.toJson(wilayah)));
                }
            }
        } catch (Exception e) {
        }
        PrintWriter out = response.getWriter();
        response.setContentType("text/html;charset=UTF-8");
        out.print(JSONValue.toJSONString(wilayahs));
        out.flush();
        out.close();
    }

}
