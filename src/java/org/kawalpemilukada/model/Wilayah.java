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

/**
 *
 * @author khairulanshar
 */
@Entity
public class Wilayah {
    @Parent public Key<StringKey> key;
    @Id public String id;
    @Index public String kpuid;
    public String nama;
    @Index public String tingkat;
    public String tahun;
    public int jumlahTPS;
    public String sudahDisetup1;
    public String sudahDisetup2;
    @Index public String parentkode;
    @Index public String kode;


    public Wilayah() {
        this.sudahDisetup1="N";
        this.sudahDisetup2="N";
        this.kode="";
        this.parentkode="";
    }
    public Wilayah(String id,String tahun) {
        this();
        this.tahun=tahun;
        this.key = Key.create(StringKey.class, id + "");
    }
}
