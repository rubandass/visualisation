from mongoengine import *
from flask import Flask, render_template, redirect, url_for
import json
from collections import namedtuple
from pymongo import MongoClient
import os
import csv
from flask import jsonify
from flask_cors import CORS
from flask import request

app = Flask(__name__)
CORS(app)
app.config.from_object('config')

connect('globalgdp')
client = MongoClient()
db = client.globalgdp

class Country(Document):
    name = StringField()
    data = DictField()    

@app.route('/readcountries')
def read_country():
    for file in os.listdir(app.config['FILES_FOLDER']):
        filename = os.fsdecode(file)
        path = os.path.join(app.config['FILES_FOLDER'],filename)
        with open(path) as csvfile:
            reader = csv.DictReader(csvfile) 
            d = list(reader)
            for data in d:
                country = Country() # a blank placeholder country
                dict = {} # a blank placeholder data dict
                for key in data: # iterate through the header keys
                    if key == "country":
                        # check if this country already exists in the db
                        country_exists = db.country.find({"name" :data.get(key)}).count() > 0
                        if not country_exists:
                            country.name = data.get(key)
                        else:
                            country = Country.objects.get(name = data.get(key))
                            dict = country.data
                    else:
                        f = filename.replace(".csv","")
                        if f in dict:
                            dict[f][key] = data[key]
                        else:
                            dict[f] = {key:data[key]}
                    # add the data dict to the country
                    country.data = dict
                # save the country
                country.save()
    return redirect(url_for("index"))

@app.route('/countries', methods=['GET'])
@app.route('/countries/<country_name>', methods=['GET'])
def get_country(country_name=None):
    if country_name is None:
        countries_list = db.country.distinct('name')
        countries_list.sort()
        return jsonify({"countries":countries_list})
    
    else:
        try:
            country_data = Country.objects.get(name = country_name)
            return country_data.to_json()
        except:
            return "Country not found"

@app.route('/')
def index():
    return render_template("base.html", title = "Home", page="home")

@app.route('/inspiration')
def inspiration():
    return render_template("inspiration.html", title = "Inspirations", page="inspiration")

@app.route("/data")    
def country_data():
    countries_list = db.country.distinct('name')
    countries_list.sort()
    return render_template("data.html", title = "Visualisation", page = "data", countries_data = countries_list)    

if __name__ =="__main__":
    app.run(debug=True, port=8080, host='0.0.0.0')
