"""
Exemple de manipulations de fichiers CSV 
Auteur : G. Richomme
"""
import csv
import sys

def ecrire_liste_dans_fichier_csv( a_ecrire, nom_fichier, delim = ";"):
    """
    Ecrit la liste de liste de listes a_ecrire dans le fichier nom_fichier 
    au format csv en utilisant delim comme delimiter (par défaut ;)
    Données :
        a_ecrire : liste de listes
        nom_fichier : chaîne de caractères
        delim : chaîne de caractères de longueur 1
    Pas de résultat
    Précondition : package csv et sys importé
    """
    try:
        file_descriptor = open( nom_fichier, "w", encoding="utf-8" ) 
        csv_writer = csv.writer(file_descriptor, dialect="unix", delimiter = delim) 
            # dialect "unix" évite l'insertion de lignes vide
        for row in a_ecrire : 
            csv_writer.writerow( row ) 
        file_descriptor.close() # fin de l'écriture
    except:
        print("Problème de fichier : ", sys.exc_info()[0])
            #permet de retourner des informations sur l'erreur générée

def lire_fichier_csv( nom_fichier, delim = ";" ):
    """
    La fonction lire_fichier_csv retourne le contenu du fichier de nom nom_fichier sous forme de liste de listes.
    Le fichier est supposé être au format csv avec comme délimiteur delim (; par défaut)
    Données :
        nom_fichier : une chaîne de caractères désignant le nom du fichier à ouvrir
        delim : chaîne de caractères de longueur 1
    Résultat :
        liste de listes de chaînes de caractères
    """
    try:
        file_descriptor = open( nom_fichier, "r", encoding="utf-8" ) 
        csv_reader = csv.reader(file_descriptor, delimiter = delim)
        res = []
        for ligne in csv_reader:
            res.append(ligne)
        file_descriptor.close()
        return res
    except:
        print("Problème de fichier : ", sys.exc_info()[0])
        return []

