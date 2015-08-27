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
import org.json.simple.JSONObject;

class Kandidat {
    @Id public Long id;
    public Integer urut;
    public String nama;
    public String img_url;

    public Kandidat() {
    }
}

/**
 *
 * @author 403036
 */
@Entity
public class KandidatWilayah {

    @Parent public Key<StringKey> key;
    @Id public String id;
    @Index public String parentkpuid;
    public String parentNama;
    public String tahun;
    @Index public String kpuid;
    @Index public String nama;
    public String dikunci;
    public ArrayList<Kandidat> kandidat;
    public ArrayList<String> namas;
    public ArrayList<Integer> uruts;

    public KandidatWilayah() {
        this.dikunci = "N";
        this.kandidat = new ArrayList();
        this.namas = new ArrayList();
        this.uruts = new ArrayList();
    }

    public KandidatWilayah(String id,String tahun) {
        this();
        this.tahun=tahun;
        this.key = Key.create(StringKey.class, id + "");
    }

    public void addkandidat(
            String nama,
            String img_url,
            Integer urut
    ) throws ParseException {
        Kandidat kandidatLocal = new Kandidat();
        kandidatLocal.nama = nama;
        kandidatLocal.img_url = img_url;
        kandidatLocal.urut=urut;
        this.kandidat.add(kandidatLocal);
        this.namas.add(nama);
        this.uruts.add(urut);
    }
    
    public JSONObject toJSONObject(int i){
        Kandidat kandidatLocal=this.kandidat.get(i);
        JSONObject kandidat=new JSONObject();
        kandidat.put("nama", kandidatLocal.nama);
        kandidat.put("id", kandidatLocal.id);
        kandidat.put("img_url", kandidatLocal.img_url);
        kandidat.put("urut", kandidatLocal.urut);
        return kandidat;
    }

    public void updatekandidat(
            Long id,
            String nama,
            String img_url,
            Integer urut
    ) throws ParseException {
        for (int i = 0; i < this.kandidat.size(); i++) {
            if (this.kandidat.get(i).id.equals(id)) {
                if (nama.length() > 0) {
                    this.kandidat.get(i).nama = nama;
                }
                if (img_url.length() > 0) {
                    this.kandidat.get(i).img_url = img_url;
                }
                if (urut.toString().length() > 0) {
                    this.kandidat.get(i).urut = urut;
                }
            }
        }
    }
}
