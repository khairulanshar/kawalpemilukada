/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.model;

/**
 *
 * @author khairulanshar
 */
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Parent;
import com.googlecode.objectify.Key;

@Entity
public class Dashboard {

    @Parent
    public Key<StringKey> key;
    @Id
    public String id;
    public String users;
    public String tasks;
    public String comments;
    public String kandidat;
    public String provinsi;
    public String kabupaten;
    public String kecamatan;
    public String desa;
    public String TPS;

    public Dashboard() {
        this.users = "0";
        this.tasks = "0";
        this.comments = "0";
        this.kandidat = "0";
        this.provinsi = "0";
        this.kabupaten = "0";
        this.kecamatan = "0";
        this.desa = "0";
        this.TPS = "0";
    }

    public Dashboard(String id) {
        this();
        this.id = id;
        this.key = Key.create(StringKey.class, id);
    }

}
