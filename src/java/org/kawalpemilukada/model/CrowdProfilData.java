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
import org.kawalpemilukada.web.controller.CommonServices;

class Profil {

    public String nama;
    public String SD;
    public String SMP;
    public String SMA;
    public String S1;
    public String S2;
    public String S3;
    public String Karir_Politik_Birokrasi;
    public String Jejak_Bisnis;
    public String Jejaring_Keluarga;
    public String Aktivitas_Sosial;
    public String Prestasi_Karya;
    public String Riwayat_Kasus;
}

/**
 *
 * @author khairulanshar
 */
@Entity
public class CrowdProfilData {

    @Parent public Key<StringKey> key;
    @Id public String kpu_paslon_id;
    @Index public String kpuid;
    public String nama;
    @Index public String parentkpuid;
    public String parentNama;
    @Index public String validated;
    public Map<String, Profil> profil;

    @Index public String diupdate_id;
    public String diupdate_nama;
    public String diupdate_img;
    public String diupdate_link;
    public Date diupdate_date;

    @Index public String direview_id;
    public String direview_nama;
    public String direview_img;
    public String direview_link;
    public Date direview_date;
    
    @Index public String visi="";
    @Index public String misi="";
    @Index public String program_pendidikan="";
    @Index public String program_hukum="";
    @Index public String program_ekonomi="";
    @Index public String dana_kampanye="";
    

    public CrowdProfilData() {
        this.validated = "N";
        this.visi = "";
        this.misi = "";
        this.program_pendidikan = "";
        this.program_hukum = "";
        this.program_ekonomi = "";
        this.dana_kampanye = "";
    }

    public CrowdProfilData(String tahun, String tingkat, String kpu_paslon_id) throws ParseException {
        this();
        this.key = Key.create(StringKey.class, CommonServices.setParentId(tahun, tingkat));
        this.kpu_paslon_id = kpu_paslon_id;
        this.profil = new HashMap<>();
        this.profil.put("ketua", new Profil());
        this.profil.put("wakil", new Profil());
    }

    public void addProfil(String level, ArrayList<String> input) {
        Profil p = new Profil();
        p.nama = input.get(0);
        p.SD = input.get(1);
        p.SMP = input.get(2);
        p.SMA = input.get(3);
        p.S1 = input.get(4);
        p.S2 = input.get(5);
        p.S3 = input.get(6);
        p.Karir_Politik_Birokrasi = input.get(7);
        p.Jejak_Bisnis = input.get(8);
        p.Jejaring_Keluarga = input.get(9);
        p.Aktivitas_Sosial = input.get(10);
        p.Prestasi_Karya = input.get(11);
        p.Riwayat_Kasus = input.get(12);
        this.profil.put(level, p);
    }
}
