/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.model;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;
import java.text.ParseException;
import java.util.Date;
import org.kawalpemilukada.web.controller.CommonServices;

@Entity
public class UserData {

    @Id public String uid;
    public String imgurl = "";
    public String nama = "";
    public String link = "";
    public String nokontak = "";
    public String email = "";
    public String provinsi = "";
    public String provinsiId = "";
    public String kabkota = "";
    public String kabkotaId = "";
    public String kecamatan = "";
    public String kecamatanId = "";
    public String desa = "";
    public String desaId = "";
    public String lat = "";
    public String lon = "";
    public String type = "";
    @Index public Date lastlogin;
    public String terverifikasi = "";
    public int userlevel = 0;
    public boolean logged = true;
    @Index public int poin = 0;

    public UserData() throws ParseException {
        this.lastlogin = CommonServices.JakartaTime();
        this.terverifikasi = "N";
        this.userlevel = 0;
    }

    public UserData(String uid) throws ParseException {
        this();
        this.uid = uid;
    }

}
