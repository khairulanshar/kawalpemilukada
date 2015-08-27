/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.web.controller;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.QueryResultList;
import com.googlecode.objectify.Key;
import static com.googlecode.objectify.ObjectifyService.ofy;
import com.googlecode.objectify.cmd.Query;
import com.googlecode.objectify.cmd.QueryKeys;
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.TimeZone;
import javax.servlet.http.HttpServletRequest;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.json.simple.parser.JSONParser;
import org.kawalpemilukada.model.Dashboard;
import org.kawalpemilukada.model.DataSuara;
import org.kawalpemilukada.model.KandidatWilayah;
import org.kawalpemilukada.model.Pesan;
import org.kawalpemilukada.model.StringKey;
import org.kawalpemilukada.model.SuaraKandidat;
import org.kawalpemilukada.model.UserData;
import org.kawalpemilukada.model.Wilayah;

/**
 *
 * @author khairulanshar
 */
public class CommonServices {

    public static final String version = "1";
    public static final String delimeter = "#";

    public static String setParentId(String val1, String val2) {
        return val1 + delimeter + val2 + delimeter + version;
    }

    public static String setParentId0(String val1, String val2) {
        return val1 + delimeter + val2;
    }

    public static String setParentId(String val1, String val2, String val3) {
        return val1 + delimeter + val2 + delimeter + val3;
    }

    public static String setParentId1(String val1, String val2, String val3) {
        return val1 + delimeter + val2 + delimeter + val3 + delimeter + version;
    }

    public static String tingkat1 = "Provinsi";
    public static String tingkat2 = "Kabupaten-Kota";
    public static String tingkat3 = "Kecamatan";
    public static String tingkat4 = "Desa";
    public static String tingkat5 = "TPS";

    public String getPropValues(String propFileName, String property, HttpServletRequest request) throws IOException {
        String result = "";
        try {
            Properties prop = new Properties();
            prop.load(request.getSession().getServletContext().getResourceAsStream("/WEB-INF/" + propFileName));
            result = prop.getProperty(property);
        } catch (Exception e) {
            System.out.println("Exception: " + e);
        }
        return result;
    }

    public static void addPoinToUser(UserData user, int point) {
        user.poin = user.poin + 10;
        ofy().save().entity(user).now();

    }

    public static void loopUpdateparent(JSONArray wilayah, DataSuara dataSuaraTPS, String type) {
        String[] s = dataSuaraTPS.id.split(delimeter);
        String tingkat = s[0];
        int last = 0;
        if (tingkat.equalsIgnoreCase(tingkat2)) {
            last = 1;
        }
        for (int wilayahi = wilayah.size() - 1; wilayahi > last; wilayahi--) {
            JSONObject wilayahj = (JSONObject) wilayah.get(wilayahi);
            String tahun = wilayahj.get("tahun").toString();
            String kpuid = wilayahj.get("kpuid").toString();
            String id = setParentId0(tingkat, wilayahj.get("tingkat").toString() + kpuid);
            JSONObject key = (JSONObject) wilayahj.get("key");
            JSONObject raw = (JSONObject) key.get("raw");
            Key<StringKey> key0 = Key.create(StringKey.class, setParentId0(tingkat, raw.get("name").toString()));
            Key<DataSuara> keyWithParent = Key.create(key0, DataSuara.class, id);
            DataSuara dataSuaraparent = ofy().load().type(DataSuara.class).ancestor(keyWithParent).first().now();
            Key<StringKey> key1 = Key.create(StringKey.class, setParentId1(tingkat, tahun, kpuid));
            List<DataSuara> dataSuaraList = ofy().load().type(DataSuara.class).ancestor(key1).list();
            if (type.equalsIgnoreCase("HC")) {
                dataSuaraparent.suarasahHC = 0;
                dataSuaraparent.suaratidaksahHC = 0;
                dataSuaraparent.jumlahTPSdilockHC = 0;
            } else {
                dataSuaraparent.suarasah = 0;
                dataSuaraparent.suaratidaksah = 0;
                dataSuaraparent.jumlahTPSdilock = 0;
                dataSuaraparent.jumlahTPStidakadaC1 = 0;
                dataSuaraparent.jumlahEntryC1Salah = 0;
            }
            for (Integer temp : dataSuaraparent.uruts) {
                if (type.equalsIgnoreCase("HC")) {
                    dataSuaraparent.suaraKandidat.get(temp.toString() + "").suaraTPS = 0;
                } else {
                    dataSuaraparent.suaraKandidat.get(temp.toString() + "").suaraVerifikasiC1 = 0;
                }
            }
            for (DataSuara d : dataSuaraList) {
                if (!d.tingkat.equalsIgnoreCase(tingkat5)) {
                    d.statusHC = dataSuaraTPS.statusHC;
                    d.dilockHC = dataSuaraTPS.dilockHC;
                    d.dilock = dataSuaraTPS.dilock;
                }
                if (type.equalsIgnoreCase("HC") && d.statusHC.equalsIgnoreCase("Y")) {
                    dataSuaraparent.suarasahHC += d.suarasahHC;
                    dataSuaraparent.suaratidaksahHC += d.suaratidaksahHC;
                    dataSuaraparent.jumlahTPSdilockHC += d.jumlahTPSdilockHC;
                }
                if ((!type.equalsIgnoreCase("HC")) && d.dilock.equalsIgnoreCase("Y")) {
                    dataSuaraparent.suarasah += d.suarasah;
                    dataSuaraparent.suaratidaksah += d.suaratidaksah;
                    dataSuaraparent.jumlahTPSdilock += d.jumlahTPSdilock;
                    dataSuaraparent.jumlahTPStidakadaC1 += d.jumlahTPStidakadaC1;
                    dataSuaraparent.jumlahEntryC1Salah += d.jumlahEntryC1Salah;
                }

                for (Integer temp : dataSuaraparent.uruts) {
                    if (type.equalsIgnoreCase("HC") && d.statusHC.equalsIgnoreCase("Y")) {
                        dataSuaraparent.suaraKandidat.get(temp.toString() + "").suaraTPS += d.suaraKandidat.get(temp.toString() + "").suaraTPS;
                    }
                    if ((!type.equalsIgnoreCase("HC")) && d.dilock.equalsIgnoreCase("Y")) {
                        dataSuaraparent.suaraKandidat.get(temp.toString() + "").suaraVerifikasiC1 += d.suaraKandidat.get(temp.toString() + "").suaraVerifikasiC1;
                    }
                }
            }
            ofy().save().entity(dataSuaraparent).now();
        }

    }

    public static void createWilayah(String[] filters) throws IOException, org.json.simple.parser.ParseException {

        String tahun = filters[0];
        String filterby = filters[1];
        String filename = filters[2];
        JSONParser parser = new JSONParser();
        Object obj = parser.parse(new FileReader("dist/data/json" + tahun + "/" + filename + ".json"));
        JSONObject jsonObject = (JSONObject) obj;
        String provName = jsonObject.get("text").toString();
        String provId = jsonObject.get("value").toString();
        JSONArray Kabupaten = (JSONArray) jsonObject.get("Kabupaten/Kota");

        Wilayah wilayah = new Wilayah(CommonServices.setParentId(tahun, "0"), tahun);
        wilayah.id = CommonServices.tingkat1 + provId;
        wilayah.kpuid = provId;
        wilayah.nama = provName;
        wilayah.tingkat = CommonServices.tingkat1;
        ofy().save().entity(wilayah).now();

        for (int i = 0; i < Kabupaten.size(); i++) {
            JSONObject kabupatenObject = (JSONObject) Kabupaten.get(i);
            String kabName = kabupatenObject.get("text").toString();
            String kabId = kabupatenObject.get("value").toString();
            JSONArray Kecamatan = (JSONArray) kabupatenObject.get("Kecamatan");

            wilayah = new Wilayah(CommonServices.setParentId(tahun, provId), tahun);
            wilayah.id = CommonServices.tingkat2 + kabId;
            wilayah.kpuid = kabId;
            wilayah.nama = kabName;
            wilayah.tingkat = CommonServices.tingkat2;
            ofy().save().entity(wilayah).now();

            for (int ii = 0; ii < Kecamatan.size(); ii++) {
                JSONObject kecamatanObject = (JSONObject) Kecamatan.get(ii);
                String kecName = kecamatanObject.get("text").toString();
                String kecId = kecamatanObject.get("value").toString();
                JSONArray Desa = (JSONArray) kecamatanObject.get("Kelurahan/Desa");

                wilayah = new Wilayah(CommonServices.setParentId(tahun, kabId), tahun);
                wilayah.id = CommonServices.tingkat3 + kecId;
                wilayah.kpuid = kecId;
                wilayah.nama = kecName;
                wilayah.tingkat = CommonServices.tingkat3;
                ofy().save().entity(wilayah).now();

                for (int iii = 0; iii < Desa.size(); iii++) {
                    JSONObject desaObject = (JSONObject) Desa.get(iii);
                    String desaName = desaObject.get("text").toString();
                    String desaId = desaObject.get("value").toString();

                    wilayah = new Wilayah(CommonServices.setParentId(tahun, kecId), tahun);
                    wilayah.id = CommonServices.tingkat4 + desaId;
                    wilayah.kpuid = desaId;
                    wilayah.nama = desaName;
                    wilayah.tingkat = CommonServices.tingkat4;
                    ofy().save().entity(wilayah).now();
                }
            }
        }
    }

    public static void createDataSuara(Wilayah w, Map<String, SuaraKandidat> suaraKandidat, String tingkat, ArrayList<String> namas, ArrayList<Integer> uruts) throws ParseException {
        DataSuara dataSuara = new DataSuara();
        dataSuara.key = Key.create(StringKey.class, setParentId0(tingkat, w.key.getRaw().getName()));
        dataSuara.tahun = w.tahun;
        dataSuara.id = setParentId0(tingkat, w.id);
        dataSuara.kpuid = w.kpuid;
        dataSuara.nama = w.nama;
        dataSuara.tingkat = w.tingkat;
        dataSuara.suaraKandidat = suaraKandidat;
        dataSuara.namas = namas;
        dataSuara.uruts = uruts;
        dataSuara.jumlahTPS = w.jumlahTPS;
        ofy().save().entity(dataSuara).now();
    }

    public static int createDataSuaraLoop(List<Wilayah> wilayahList, Map<String, SuaraKandidat> suaraKandidat, String tingkat, ArrayList<String> namas, ArrayList<Integer> uruts) throws ParseException {
        int jumlahTPS = 0;
        for (Wilayah w : wilayahList) {
            if (!w.tingkat.equalsIgnoreCase(tingkat5)) {
                List<Wilayah> wilayah = CommonServices.filterWilayah(w.tahun, w.kpuid, "", "");
                int jumlahTPS0 = createDataSuaraLoop(wilayah, suaraKandidat, tingkat, namas, uruts);
                if (w.tingkat.equalsIgnoreCase(tingkat4)) {
                    w.jumlahTPS = wilayah.size();
                } else {
                    w.jumlahTPS = jumlahTPS0;
                }
                jumlahTPS = jumlahTPS + w.jumlahTPS;
            } else {
                w.jumlahTPS = 1;
            }

            createDataSuara(w, suaraKandidat, tingkat, namas, uruts);
            if (tingkat.equalsIgnoreCase(tingkat1)) {
                w.sudahDisetup1 = "Y";
            } else {
                w.sudahDisetup2 = "Y";
            }
            ofy().save().entity(w).now();
        }
        return jumlahTPS;
    }

    public static void loadProvisnsi(Dashboard dashboard, String tahun) {
        try {
            if (tahun.equalsIgnoreCase("2015")) {
                InputStream feedStream = new FileInputStream("dist/data/propinsi" + tahun + ".json");
                InputStreamReader is = new InputStreamReader(feedStream);
                StringBuilder sb1 = new StringBuilder();
                BufferedReader br = new BufferedReader(is);
                String read = br.readLine();
                while (read != null) {
                    sb1.append(read);
                    read = br.readLine();
                }
                JSONArray propinsis = (JSONArray) JSONValue.parse(sb1.toString());
                for (int i = 0; i < propinsis.size(); i++) {
                    Wilayah wilayah = new Wilayah(CommonServices.setParentId(tahun, "0"), tahun);
                    JSONArray propinsi = (JSONArray) propinsis.get(i);
                    wilayah.id = CommonServices.tingkat1 + propinsi.get(1).toString();
                    wilayah.kpuid = propinsi.get(1).toString();
                    wilayah.nama = propinsi.get(2).toString();
                    wilayah.tingkat = CommonServices.tingkat1;
                    ofy().save().entity(wilayah).now();
                }
                dashboard.provinsi = propinsis.size() + "";
            }
            if (tahun.equalsIgnoreCase("2014")) {
                InputStream feedStream = new FileInputStream("dist/data/propinsi" + tahun + ".csv");
                InputStreamReader is = new InputStreamReader(feedStream);
                BufferedReader br = new BufferedReader(is);
                String read = br.readLine();
                String cvsSplitBy = ",";
                int i = 0;
                while (read != null) {
                    i++;
                    try {
                        String[] kelurahan = read.split(cvsSplitBy);
                        Wilayah wilayah = new Wilayah(CommonServices.setParentId(tahun, kelurahan[0]), tahun);
                        wilayah.id = CommonServices.tingkat1 + kelurahan[1];
                        wilayah.kpuid = kelurahan[1];
                        wilayah.nama = kelurahan[2].replace("\"", "");
                        wilayah.tingkat = CommonServices.tingkat1;
                        ofy().save().entity(wilayah).now();
                    } catch (Exception e) {
                    }
                    read = br.readLine();
                }
                dashboard.provinsi = i + "";
            }
            ofy().save().entity(dashboard).now();
        } catch (Exception e) {
        }
    }

    public static void loadKabupaten(Dashboard dashboard, String tahun) {
        try {
            if (tahun.equalsIgnoreCase("2015")) {
                InputStream feedStream = new FileInputStream("dist/data/kabkota" + tahun + ".json");
                InputStreamReader is = new InputStreamReader(feedStream);
                StringBuilder sb1 = new StringBuilder();
                BufferedReader br = new BufferedReader(is);
                String read = br.readLine();
                while (read != null) {
                    sb1.append(read);
                    read = br.readLine();
                }
                JSONArray propinsis = (JSONArray) JSONValue.parse(sb1.toString());
                for (int i = 0; i < propinsis.size(); i++) {
                    JSONArray propinsi = (JSONArray) propinsis.get(i);
                    Wilayah wilayah = new Wilayah(CommonServices.setParentId(tahun, propinsi.get(1).toString()), tahun);
                    wilayah.id = CommonServices.tingkat2 + propinsi.get(2).toString();
                    wilayah.kpuid = propinsi.get(2).toString();
                    wilayah.nama = propinsi.get(4).toString();
                    wilayah.tingkat = CommonServices.tingkat2;
                    ofy().save().entity(wilayah).now();
                }
                dashboard.kabupaten = propinsis.size() + "";
            }
            if (tahun.equalsIgnoreCase("2014")) {
                InputStream feedStream = new FileInputStream("dist/data/kabkota" + tahun + ".csv");
                InputStreamReader is = new InputStreamReader(feedStream);
                BufferedReader br = new BufferedReader(is);
                String read = br.readLine();
                String cvsSplitBy = ",";
                int i = 0;
                while (read != null) {
                    i++;
                    try {
                        String[] kelurahan = read.split(cvsSplitBy);
                        Wilayah wilayah = new Wilayah(CommonServices.setParentId(tahun, kelurahan[0]), tahun);
                        wilayah.id = CommonServices.tingkat2 + kelurahan[1];
                        wilayah.kpuid = kelurahan[1];
                        wilayah.nama = kelurahan[2].replace("\"", "");
                        wilayah.tingkat = CommonServices.tingkat2;
                        ofy().save().entity(wilayah).now();
                    } catch (Exception e) {
                    }
                    read = br.readLine();
                }
                dashboard.kabupaten = i + "";
            }
            ofy().save().entity(dashboard).now();
        } catch (Exception e) {
        }
    }

    public static void loadKecamatan(HttpServletRequest request, Dashboard dashboard, String tahun) {
        try {
            UserData user = CommonServices.getUser(request);
            if (user.userlevel < 1000) {
                return;
            }
            InputStream feedStream = new FileInputStream("dist/data/kecamatan" + tahun + ".csv");
            InputStreamReader is = new InputStreamReader(feedStream);
            BufferedReader br = new BufferedReader(is);
            String read = br.readLine();
            String cvsSplitBy = ",";
            int i = 0;
            while (read != null) {
                i++;
                try {
                    String[] kelurahan = read.split(cvsSplitBy);
                    Wilayah wilayah = new Wilayah(CommonServices.setParentId(tahun, kelurahan[0]), tahun);
                    wilayah.id = CommonServices.tingkat3 + kelurahan[1];
                    wilayah.kpuid = kelurahan[1];
                    wilayah.nama = kelurahan[2].replace("\"", "");
                    wilayah.tingkat = CommonServices.tingkat3;
                    ofy().save().entity(wilayah).now();
                } catch (Exception e) {
                }
                read = br.readLine();
            }
            dashboard.kecamatan = i + "";
            ofy().save().entity(dashboard).now();
        } catch (Exception e) {
            System.out.println(e.toString());
        }
    }

    public static void loadDesa(HttpServletRequest request, Dashboard dashboard, String tahun) {
        try {
            UserData user = CommonServices.getUser(request);
            if (user.userlevel < 1000) {
                return;
            }
            InputStream feedStream = new FileInputStream("dist/data/kelurahan" + tahun + ".csv");
            InputStreamReader is = new InputStreamReader(feedStream);
            BufferedReader br = new BufferedReader(is);
            String read = br.readLine();
            String cvsSplitBy = ",";
            int i = 0;
            while (read != null) {
                i++;
                try {
                    String[] kelurahan = read.split(cvsSplitBy);
                    Wilayah wilayah = new Wilayah(CommonServices.setParentId(tahun, kelurahan[0]), tahun);
                    wilayah.id = CommonServices.tingkat4 + kelurahan[1];
                    wilayah.kpuid = kelurahan[1];
                    wilayah.nama = kelurahan[2].replace("\"", "");
                    wilayah.tingkat = CommonServices.tingkat4;
                    ofy().save().entity(wilayah).now();
                } catch (Exception e) {
                }
                read = br.readLine();
            }
            dashboard.desa = i + "";
            ofy().save().entity(dashboard).now();
        } catch (Exception e) {
            System.out.println(e.toString());
        }
    }

    public static void loadTPS(HttpServletRequest request, Dashboard dashboard, String tahun, String no) {
        try {
            UserData user = CommonServices.getUser(request);
            if (user.userlevel < 1000) {
                return;
            }
            InputStream feedStream = new FileInputStream("dist/data/tps" + tahun + no + ".csv");
            InputStreamReader is = new InputStreamReader(feedStream);
            BufferedReader br = new BufferedReader(is);
            String read = br.readLine();
            String cvsSplitBy = ",";
            int i = 0;
            while (read != null) {
                i++;
                try {
                    String[] tpsline = read.split(cvsSplitBy);
                    Wilayah wilayah = new Wilayah(CommonServices.setParentId(tahun, tpsline[0]), tahun);
                    wilayah.id = CommonServices.tingkat5 + tpsline[1];
                    wilayah.kpuid = tpsline[1];
                    wilayah.nama = tpsline[2].replace("\"", "");
                    wilayah.tingkat = CommonServices.tingkat5;
                    ofy().save().entity(wilayah).now();
                } catch (Exception e) {
                }
                read = br.readLine();
            }
            dashboard.TPS = (Integer.parseInt(dashboard.TPS) + i) + "";
            if (tahun.contains("2014")) {
                dashboard.TPS = 478731 + "";
            }
            ofy().save().entity(dashboard).now();
        } catch (Exception e) {
            System.out.println(e.toString());
        }
    }

    public static List<Wilayah> filterWilayah(String tahun, String parentId, String filterBy, String filter) {
        Key<StringKey> dashKey = Key.create(StringKey.class, CommonServices.setParentId(tahun, parentId));
        Query<Wilayah> query = ofy().load().type(Wilayah.class).ancestor(dashKey);
        if (filterBy.length() > 0 && filter.length() > 0) {
            query = query.filter(filterBy, filter);
        }
        return query.list();
    }

    public static List<KandidatWilayah> filterKandidatWilayah(String tahun, String parentId, String filterBy, String filter) {
        Key<StringKey> dashKey = Key.create(StringKey.class, CommonServices.setParentId(tahun, parentId));
        Query<KandidatWilayah> query = ofy().load().type(KandidatWilayah.class).ancestor(dashKey);
        if (filterBy.length() > 0 && filter.length() > 0) {
            query = query.filter(filterBy, filter);
        }
        return query.list();
    }

    public static QueryResultList<Entity> getPesans(String key, String filter, String filterBy, String cursorStr, int offset, int limit) {
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        FetchOptions fetchOptions = FetchOptions.Builder.withLimit(limit);
        com.google.appengine.api.datastore.Key keyx = KeyFactory.createKey("StringKey", "wall");
        com.google.appengine.api.datastore.Query query = new com.google.appengine.api.datastore.Query("Pesan", keyx);
        query.addSort("creationDate", com.google.appengine.api.datastore.Query.SortDirection.DESCENDING);
        QueryResultList<Entity> pesans = datastore.prepare(query).asQueryResultList(fetchOptions);
        return pesans;
    }

    public static Query<Pesan> getPesan(String key, String filter, String filterBy, String cursorStr, int offset, int limit) {
        Key<StringKey> dashKey = Key.create(StringKey.class, key);
        Query<Pesan> query = ofy().load().type(Pesan.class).ancestor(dashKey);
        /*if (cursorStr != null && cursorStr.length() > 0) {
         query = query.startAt(Cursor.fromWebSafeString(cursorStr));
         }*/
        if (filterBy.length() > 0 && filter.length() > 0) {
            query = query.filter(filterBy, filter);
        }
        //query = query.filter("status", "Y");
        query = query.order("-creationDate").offset(offset).limit(limit);
        //https://code.google.com/p/getStartCursor-appengine/wiki/Queries#Cursor_Example
        return query;
    }
    public static int countPesan(String key) {
        Key<StringKey> dashKey = Key.create(StringKey.class, key);
        QueryKeys<Pesan> query = ofy().load().type(Pesan.class).ancestor(dashKey).keys();
        return query.list().size();
    }

    public static UserData getUser(HttpServletRequest request) {
        UserData userData = null;
        try {
            JSONObject user = (JSONObject) request.getSession().getAttribute("UserData");
            if (user != null && user.get("uid").toString().length() > 0) {
                userData = ofy().load().type(UserData.class).id(user.get("uid").toString()).now();
            }
        } catch (Exception e) {
        }
        return userData;
    }

    public static Dashboard getDashboard(String versi) {
        Dashboard dashboard = null;
        Key<StringKey> dashKey = Key.create(StringKey.class, versi);
        List<Dashboard> dashboards = ofy()
                .load()
                .type(Dashboard.class) // We want only Greetings
                .ancestor(dashKey) // Anyone in this book
                .limit(1) // Only show 5 of them.
                .list();
        if (dashboards.isEmpty()) {
            dashboard = new Dashboard(versi);
            ofy().save().entity(dashboard).now();
        } else {
            dashboard = dashboards.get(0);
        }
        return dashboard;
    }

    public static int getuserSize() {
        QueryKeys<UserData> query = ofy()
                .load()
                .type(UserData.class).keys();
        return query.list().size();

    }

    public static String getVal(Object u) {
        String retval = "";
        try {
            retval = u.toString();
        } catch (Exception ee) {
            retval = (String) u;
        }
        if (u == null) {
            retval = "";
        }
        return retval;
    }

    public static JSONObject post(JSONObject input, String endpoint, String Method) throws IOException {
        JSONObject returnVal = null;
        URL url;
        try {
            url = new URL(endpoint);
        } catch (MalformedURLException e) {
            throw new IllegalArgumentException("invalid url: " + endpoint);
        }

        HttpURLConnection conn = null;
        try {
            conn = (HttpURLConnection) url.openConnection();
            conn.setDoOutput(true);
            conn.setUseCaches(false);
            conn.setDoInput(true);
            conn.setRequestMethod(Method);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Authorization", "dob1DSh6nlHBMVhjifLi#40f706d0-16fb-43fb-b186-bf0d9142aa62");
            if (!Method.equalsIgnoreCase("GET")) {
                String body = JSONValue.toJSONString(input);
                conn.setFixedLengthStreamingMode(body.getBytes().length);
                conn.getOutputStream().write(body.getBytes());
            }
            conn.connect();
            // handle the response
            int status = conn.getResponseCode();
            if (status != 200) {
            } else {
                BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder sb1 = new StringBuilder();
                String read = br.readLine();
                while (read != null) {
                    sb1.append(read);
                    read = br.readLine();
                }
                returnVal = (JSONObject) JSONValue.parse(sb1.toString());
            }
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
        return returnVal;
    }

    public static Date JakartaTime() throws ParseException {
        SimpleDateFormat dateFormatGmt = new SimpleDateFormat("yyyy-MMM-dd HH:mm:ss");
        dateFormatGmt.setTimeZone(TimeZone.getTimeZone("Asia/Jakarta"));
        //Local time zone   
        SimpleDateFormat dateFormatLocal = new SimpleDateFormat("yyyy-MMM-dd HH:mm:ss");
        //Time in JakartaTime
        return dateFormatLocal.parse(dateFormatGmt.format(new Date()));
    }
}
