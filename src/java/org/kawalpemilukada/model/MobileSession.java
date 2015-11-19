/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.model;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Parent;
import java.text.ParseException;
import java.util.UUID;

/**
 *
 * @author khairulanshar
 */
@Entity
public class MobileSession {

    @Id
    public String id;
    public String uuid;
    public String platform;
    public String version;
    public String cordova;
    public String model;
    public String manufacturer;
    public String appversion;

    public MobileSession() {
        this.uuid = UUID.randomUUID().toString();
    }

    public MobileSession(String key) {
        this();
        this.id = key;
    }
}
