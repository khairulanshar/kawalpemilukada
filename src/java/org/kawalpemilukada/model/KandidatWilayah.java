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
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

class Kandidat {

    @Id
    public Long id;
    public Integer urut;
    public String kpu_id_peserta;
    public String nama;
    public String img_url;
    public Integer jumlahKomentar;
    public Integer suaraTPS;
    public Integer suaraVerifikasiC1;
    public Integer suaraKPU;
    public String partaiPendukung;
    public String jenisDukungan;
    public String jeniskelamin1;
    public String jeniskelamin2;

    public Kandidat() {
        this.jumlahKomentar = 0;
        this.suaraTPS = 0;
        this.suaraVerifikasiC1 = 0;
        this.suaraKPU = 0;
        this.partaiPendukung = "";
        this.jenisDukungan="";
        this.jeniskelamin1="";
        this.jeniskelamin2="";
    }
}

/**
 *
 * @author 403036
 */
@Entity
public class KandidatWilayah {

    @Parent
    public Key<StringKey> key;
    @Id
    public String id;
    @Index
    public String parentkpuid;
    @Index
    public String parentkode;
    public String parentNama;
    public String tahun;
    @Index
    public String kpuid;
    @Index
    public String kode;
    public String nama;
    public String dikunci;
    public ArrayList<Kandidat> kandidat;
    public ArrayList<String> namas;
    public ArrayList<Integer> uruts;
    public Integer jumlahTPSdilock;
    public Integer jumlahTPS;
    public Integer suarasah;
    public Integer suaratidaksah;
    public Kandidat kandidatPemenang;
    public Integer totalpemilih;

    public KandidatWilayah() {
        this.dikunci = "N";
        this.kandidat = new ArrayList();
        this.namas = new ArrayList();
        this.uruts = new ArrayList();
        this.jumlahTPSdilock = 0;
        this.jumlahTPS = 0;
        this.suarasah = 0;
        this.suaratidaksah = 0;
        this.totalpemilih=0;
        this.kode = "";
        this.parentkode = "";
        kandidatPemenang = new Kandidat();
    }

    public KandidatWilayah(String id, String tahun) {
        this();
        this.tahun = tahun;
        this.key = Key.create(StringKey.class, id + "");
    }

    public void addkandidat(
            String nama,
            String img_url,
            Integer urut,
            String kpu_id_peserta
    ) throws ParseException {
        boolean found = false;
        for (int i = 0; i < this.kandidat.size(); i++) {
            if (this.kandidat.get(i).urut == urut) {
                found = true;
                if (nama.length() > 0) {
                    this.kandidat.get(i).nama = nama;
                }
                if (img_url.length() > 0) {
                    this.kandidat.get(i).img_url = img_url;
                }
                if (kpu_id_peserta.length() > 0) {
                    this.kandidat.get(i).kpu_id_peserta = kpu_id_peserta;
                }
            }
        }
        if (!found) {
            Kandidat kandidatLocal = new Kandidat();
            kandidatLocal.nama = nama;
            kandidatLocal.img_url = img_url;
            kandidatLocal.urut = urut;
            kandidatLocal.kpu_id_peserta = kpu_id_peserta;
            this.kandidat.add(kandidatLocal);
            this.namas.add(nama);
            this.uruts.add(urut);
        }
    }

    public JSONObject toJSONObject(int i) {
        Kandidat kandidatLocal = this.kandidat.get(i);
        JSONObject kandidat = new JSONObject();
        kandidat.put("nama", kandidatLocal.nama);
        kandidat.put("id", kandidatLocal.id);
        kandidat.put("img_url", kandidatLocal.img_url);
        kandidat.put("urut", kandidatLocal.urut);
        kandidat.put("jumlahKomentar", kandidatLocal.jumlahKomentar);
        kandidat.put("kpu_id_peserta", kandidatLocal.kpu_id_peserta);
        return kandidat;
    }

    public void set0() {
        for (int i = 0; i < this.kandidat.size(); i++) {
            this.kandidat.get(i).suaraTPS = 0;
            this.kandidat.get(i).suaraVerifikasiC1 = 0;
            this.kandidat.get(i).suaraKPU = 0;
        }
    }

    public void addsuara(Integer urut,
            Integer suaraTPS,
            Integer suaraVerifikasiC1,
            Integer suaraKPU,
            JSONObject jsonObject) {
        for (int i = 0; i < this.kandidat.size(); i++) {
            if (this.kandidat.get(i).urut == urut) {
                if (i==0){
                    this.kandidatPemenang=this.kandidat.get(i);
                }
                this.kandidat.get(i).suaraTPS += suaraTPS;
                this.kandidat.get(i).suaraVerifikasiC1 += suaraVerifikasiC1;
                this.kandidat.get(i).suaraKPU += suaraKPU;
                try {
                    JSONArray data = (JSONArray) jsonObject.get(this.kandidat.get(i).kpu_id_peserta+"");
                    this.kandidat.get(i).partaiPendukung = data.get(8).toString();
                    this.kandidat.get(i).jenisDukungan=data.get(7).toString();
                    this.kandidat.get(i).jeniskelamin1=data.get(2).toString();
                    this.kandidat.get(i).jeniskelamin2=data.get(5).toString();
                } catch (Exception e) {}
                if (this.kandidat.get(i).suaraVerifikasiC1>this.kandidatPemenang.suaraVerifikasiC1){
                    this.kandidatPemenang=this.kandidat.get(i);
                }
            }
        }
    }

    public void updatekandidat(
            String nama,
            String img_url,
            Integer urut,
            Integer jumlahKomentar,
            String kpu_id_peserta,
            Integer suaraTPS,
            Integer suaraVerifikasiC1,
            Integer suaraKPU
    ) throws ParseException {
        for (int i = 0; i < this.kandidat.size(); i++) {
            if (this.kandidat.get(i).urut == urut) {
                if (nama.length() > 0) {
                    this.kandidat.get(i).nama = nama;
                }
                if (img_url.length() > 0) {
                    this.kandidat.get(i).img_url = img_url;
                }
                if (jumlahKomentar > -1) {
                    this.kandidat.get(i).jumlahKomentar = jumlahKomentar;
                }
                if (kpu_id_peserta.length() > 0) {
                    this.kandidat.get(i).kpu_id_peserta = kpu_id_peserta;
                }
                if (suaraTPS > 0) {
                    this.kandidat.get(i).suaraTPS = suaraTPS;
                }
                if (suaraTPS > 0) {
                    this.kandidat.get(i).suaraVerifikasiC1 = suaraVerifikasiC1;
                }
                if (suaraTPS > 0) {
                    this.kandidat.get(i).suaraKPU = suaraKPU;
                }
            }
        }
    }
}
