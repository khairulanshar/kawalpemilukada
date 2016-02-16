/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.model;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;
import com.googlecode.objectify.annotation.Parent;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 *
 * @author 403036
 */
@Entity
public class DataSuara {

    @Parent
    public Key<StringKey> key;
    @Id
    public String id;
    @Index
    public String kpuid;
    public int kpuid_int;
    public String nama;
    public String grandparentkpuid;
    public String parentkpuid;
    public String parentnama;
    @Index
    public String tingkat;
    public String tingkatPilkada;
    @Index
    public String tahun;
    @Index
    public String dilock;
    @Index
    public String dilockHC;
    @Index
    public String tandaiSalah;
    @Index
    public String statusHC;
    public ArrayList<String> namas;
    public ArrayList<Integer> uruts;
    public int suarasahHC;
    public int suaratidaksahHC;
    public int suarasah;
    public int suaratidaksah;
    public int suarasahKPU;
    public int suaratidaksahKPU;
    public int jumlahTPSKPUTotal;
    public int jumlahTPSKPU;
    public int jumlahTPS;
    public int jumlahTPSdilock;
    public int jumlahTPSdilockHC;
    public Map<String, SuaraKandidat> suaraKandidat;

    @Index
    public String tps_diupdate_id;
    public String tps_diupdate_nama;
    public String tps_diupdate_img;
    public String tps_diupdate_link;
    public Date tps_diupdate_date;

    @Index
    public String tps_direview_id;
    public String tps_direview_nama;
    public String tps_direview_img;
    public String tps_direview_link;
    public Date tps_direview_date;
    public ArrayList<filePesan> tps_file;
    @Index
    public String c1_direview_id;
    public String c1_direview_nama;
    public String c1_direview_img;
    public String c1_direview_link;
    public Date c1_direview_date;
    @Index
    public String tidakadaC1;
    public int jumlahTPStidakadaC1;

    public int jumlahEntryC1Salah;

    public String urllink;
    public String kpugambar1;
    public String kpugambar2;
    public String kpugambar3;
    public String kpugambar4;
    public String kpugambar5;

    public String sudahDiloadDariKawalC1;

    public DataSuara() throws ParseException {
        this.suaraKandidat = new HashMap<>();
        this.tps_file = new ArrayList();
        this.namas = new ArrayList();
        this.uruts = new ArrayList();
        this.suarasah = 0;
        this.suaratidaksah = 0;
        this.suarasahKPU = 0;
        this.suaratidaksahKPU = 0;
        this.suarasahHC = 0;
        this.suaratidaksahHC = 0;
        this.dilock = "N";
        this.dilockHC = "N";
        this.jumlahTPSdilock = 0;
        this.jumlahTPSdilockHC = 0;
        this.tandaiSalah = "N";
        this.statusHC = "N";
        this.tidakadaC1 = "N";
        this.jumlahTPSKPU = 0;
        this.jumlahTPSKPUTotal = 0;
        this.jumlahTPStidakadaC1 = 0;
        this.jumlahEntryC1Salah = 0;
        this.urllink = "";
        this.kpugambar1 = "";
        this.kpugambar2 = "";
        this.kpugambar3 = "";
        this.kpugambar4 = "";
        this.kpugambar5 = "";
        this.tingkatPilkada = "";
        this.sudahDiloadDariKawalC1 = "N";
        this.grandparentkpuid = "";
        this.parentkpuid = "";
        this.parentnama = "";
    }

    public void addFile(
            String fileName,
            String fileType,
            String key,
            String fileLink
    ) throws ParseException {
        filePesan file = new filePesan();
        file.fileName = fileName;
        file.fileType = fileType;
        file.key = key;
        file.fileLink = fileLink;
        this.tps_file.add(file);
    }

}
