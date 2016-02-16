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

import org.kawalpemilukada.web.controller.CommonServices;

class childPesan {

    public String dari_id;
    public String dari_nama;
    public String dari_img;
    public String dari_link;
    public String msg;
    public Date creationDate;
}

class filePesan {

    public String fileName;
    public String fileType;
    public String fileLink;
    public String key;
}

/**
 *
 * @author khairulanshar
 */
@Entity
public class Pesan {
    /*key nya bisa [wall,msguserid,alertuserid]*/

    @Parent
    public Key<StringKey> key;
    @Id public Long id;
    @Index public String dari_id;
    public String dari_nama;
    public String dari_img;
    public String dari_link;
    @Index public String untuk_id;
    public String untuk_nama;
    public String untuk_img;
    public String untuk_link;
    public String msg;
    public String icon;
    @Index public Date creationDate;
    ArrayList<childPesan> tanggapanPesans;
    ArrayList<childPesan> setujuPesans;
    ArrayList<childPesan> tidakSetujuPesans;
    ArrayList<filePesan> files;
    @Index public String status;

    public Pesan() throws ParseException {
        this.tanggapanPesans = new ArrayList();
        this.setujuPesans = new ArrayList();
        this.tidakSetujuPesans = new ArrayList();
        this.files = new ArrayList();
        this.creationDate = CommonServices.JakartaTime();
        this.status="Y";
    }

    public Pesan(String key) throws ParseException {
        this();
        this.key = Key.create(StringKey.class, key);
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
        this.files.add(file);
    }

    public void addTanggapan(
            String dari_id,
            String dari_nama,
            String dari_img,
            String dari_link,
            String msg
    ) throws ParseException {
        childPesan child = new childPesan();
        child.dari_id = dari_id;
        child.dari_nama = dari_nama;
        child.dari_img = dari_img;
        child.dari_link = dari_link;
        child.msg = msg;
        child.creationDate = CommonServices.JakartaTime();
        this.tanggapanPesans.add(0, child);
    }

    public void addSetuju(
            String dari_id,
            String dari_nama,
            String dari_img,
            String dari_link,
            String msg
    ) throws ParseException {
        boolean notfound = true;
        for (childPesan temp : this.setujuPesans) {
            if (dari_id.equalsIgnoreCase(temp.dari_id)) {
                notfound = false;
            }
        }
        for (childPesan temp : this.tidakSetujuPesans) {
            if (dari_id.equalsIgnoreCase(temp.dari_id)) {
                notfound = false;
            }
        }
        if (notfound) {
            childPesan child = new childPesan();
            child.dari_id = dari_id;
            child.dari_nama = dari_nama;
            child.dari_img = dari_img;
            child.dari_link = dari_link;
            child.msg = msg;
            child.creationDate = CommonServices.JakartaTime();
            this.setujuPesans.add(0, child);
        }
    }

    public void addTidakSetuju(
            String dari_id,
            String dari_nama,
            String dari_img,
            String dari_link,
            String msg
    ) throws ParseException {
        boolean notfound = true;
        for (childPesan temp : this.setujuPesans) {
            if (dari_id.equalsIgnoreCase(temp.dari_id)) {
                notfound = false;
            }
        }
        for (childPesan temp : this.tidakSetujuPesans) {
            if (dari_id.equalsIgnoreCase(temp.dari_id)) {
                notfound = false;
            }
        }
        if (notfound) {
            childPesan child = new childPesan();
            child.dari_id = dari_id;
            child.dari_nama = dari_nama;
            child.dari_img = dari_img;
            child.dari_link = dari_link;
            child.msg = msg;
            child.creationDate = CommonServices.JakartaTime();
            this.tidakSetujuPesans.add(0, child);
        }
    }

}
