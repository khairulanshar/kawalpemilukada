/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.model;

import com.googlecode.objectify.annotation.Id;

/**
 *
 * @author khairulanshar
 */
public class SuaraKandidat {
    @Id public Long id;
    public Long urut;
    public String nama;
    public String img_url;
    public int suaraTPS;
    public int suaraVerifikasiC1;

    public SuaraKandidat() {
        this.suaraTPS = 0;
        this.suaraVerifikasiC1 = 0;
    }
}
