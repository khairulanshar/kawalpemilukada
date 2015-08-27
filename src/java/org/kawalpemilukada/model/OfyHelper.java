/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.kawalpemilukada.model;

import com.googlecode.objectify.ObjectifyService;

import javax.servlet.ServletContextListener;
import javax.servlet.ServletContextEvent;

/**
 * OfyHelper, a ServletContextListener, is setup in web.xml to run before a JSP is run.  This is
 * required to let JSP's access Ofy.
 **/
public class OfyHelper implements ServletContextListener {

    public void contextInitialized(ServletContextEvent event) {
    // This will be invoked as part of a warmup request, or the first user
    // request if no warmup request was invoked. 
        ObjectifyService.register(StringKey.class);
        ObjectifyService.register(UserData.class);
        ObjectifyService.register(Dashboard.class);
        ObjectifyService.register(Wilayah.class);   
        ObjectifyService.register(Pesan.class);
        ObjectifyService.register(KandidatWilayah.class);
        ObjectifyService.register(DataSuara.class);
    }

    public void contextDestroyed(ServletContextEvent event) {
        // App Engine does not currently invoke this method.
    }
}
