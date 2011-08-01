#!/usr/bin/env python
import re
import xml.sax.handler
import urllib
import sys

def xml2obj(src):
    """
    A simple function to converts XML data into native Python object.
    """

    non_id_char = re.compile('[^_0-9a-zA-Z]')
    def _name_mangle(name):
        return non_id_char.sub('_', name)

    class DataNode(object):
        def __init__(self):
            self._attrs = {}    # XML attributes and child elements
            self.data = None    # child text data
        def __len__(self):
            # treat single element as a list of 1
            return 1
        def __getitem__(self, key):
            if isinstance(key, basestring):
                return self._attrs.get(key,None)
            else:
                return [self][key]
        def __contains__(self, name):
            return self._attrs.has_key(name)
        def __nonzero__(self):
            return bool(self._attrs or self.data)
        def __getattr__(self, name):
            if name.startswith('__'):
                # need to do this for Python special methods???
                raise AttributeError(name)
            return self._attrs.get(name,None)
        def _add_xml_attr(self, name, value):
            if name in self._attrs:
                # multiple attribute of the same name are represented by a list
                children = self._attrs[name]
                if not isinstance(children, list):
                    children = [children]
                    self._attrs[name] = children
                children.append(value)
            else:
                self._attrs[name] = value
        def __str__(self):
            return self.data or ''
        def __repr__(self):
            items = sorted(self._attrs.items())
            if self.data:
                items.append(('data', self.data))
            return u'{%s}' % ', '.join([u'%s:%s' % (k,repr(v)) for k,v in items])

    class TreeBuilder(xml.sax.handler.ContentHandler):
        def __init__(self):
            self.stack = []
            self.root = DataNode()
            self.current = self.root
            self.text_parts = []
        def startElement(self, name, attrs):
            self.stack.append((self.current, self.text_parts))
            self.current = DataNode()
            self.text_parts = []
            # xml attributes --> python attributes
            for k, v in attrs.items():
                self.current._add_xml_attr(_name_mangle(k), v)
        def endElement(self, name):
            text = ''.join(self.text_parts).strip()
            if text:
                self.current.data = text
            if self.current._attrs:
                obj = self.current
            else:
                # a text only node is simply represented by the string
                obj = text or ''
            self.current, self.text_parts = self.stack.pop()
            self.current._add_xml_attr(_name_mangle(name), obj)
        def characters(self, content):
            self.text_parts.append(content)

    builder = TreeBuilder()
    if isinstance(src,basestring):
        xml.sax.parseString(src, builder)
    else:
        xml.sax.parse(src, builder)
    return builder.root._attrs.values()[0]


def print_mul(string):
    
    slist = string.split(' ')
    
    while (len(slist) >= 10): 
        print "terminal.print('",
        i=0
        print " ",
        while i < 10:
            print slist[i].replace('\n',' '),
            i =i+1
        print "');"
        slist = slist[10:]


    if(len(slist) != 0):
        print "terminal.print('",
        for i in slist:
            print i.replace('\n',' '), 
        print "');"
     

if __name__ == "__main__":


#    data = urllib.urlopen("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fdearblankpleaseblank.com%2Fwtf.php%22%20and%20xpath%3D'%2F%2Fdiv%5B%40class%3D%22subcontainer%22%5D%2Fdiv%5B%40class!%3D%22sharing%22%20or%20%40class%3D%22subtextplease%22%20or%20%40class%3D%22submittedby%22%5D%2F%2Fp'&diagnostics=true")
#    data = urllib.urlopen("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fdearblankpleaseblank.com%2Flike.php%22%20and%20xpath%3D'%2F%2Fdiv%5B%40class%3D%22subcontainer%22%5D%2Fdiv%5B%40class!%3D%22sharing%22%20or%20%40class%3D%22subtextplease%22%20or%20%40class%3D%22submittedby%22%5D%2F%2Fp'&diagnostics=true")
#    data = urllib.urlopen("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fdearblankpleaseblank.com%2Fhilarious.php%22%20and%20xpath%3D'%2F%2Fdiv%5B%40class%3D%22subcontainer%22%5D%2Fdiv%5B%40class!%3D%22sharing%22%20or%20%40class%3D%22subtextplease%22%20or%20%40class%3D%22submittedby%22%5D%2F%2Fp'&diagnostics=true")
#    data = urllib.urlopen("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fdearblankpleaseblank.com%2Fdouche.php%22%20and%20xpath%3D'%2F%2Fdiv%5B%40class%3D%22subcontainer%22%5D%2Fdiv%5B%40class!%3D%22sharing%22%20or%20%40class%3D%22subtextplease%22%20or%20%40class%3D%22submittedby%22%5D%2F%2Fp'&diagnostics=true")
    data = urllib.urlopen("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fdearblankpleaseblank.com%2Fdare.php%22%20and%20xpath%3D'%2F%2Fdiv%5B%40class%3D%22subcontainer%22%5D%2Fdiv%5B%40class!%3D%22sharing%22%20or%20%40class%3D%22subtextplease%22%20or%20%40class%3D%22submittedby%22%5D%2F%2Fp'&diagnostics=true")
   

    tree = xml2obj(data)
    stringlist = tree.results.p

    start = []
    mid = []
    end = []

    x = 0
    
    while x < len(stringlist):
        start.append(stringlist[x])
        x = x+3
    

    x = 1
    
    while x < len(stringlist):
        mid.append(stringlist[x])
        x = x+3

    x = 2
    
    while x < len(stringlist):
        end.append(stringlist[x])
        x = x+3


    x = 0
    

    print("HOW_FS = {");

    while x < len(start):
        dap = "'"+start[x].replace(' ', '_')[:-1].replace("\'", "")
        if (len(dap)>20):
            dap = dap[0:20]
            
        print dap+"' : {type:'file', read:function(terminal) {"
        #print "terminal.print('"+ mid[x].replace('\n', '')+"');"
	
        
	print_mul(mid[x].replace("\'", ""))
 	print_mul(end[x].replace("\'", "")) 
        print "}}",
        x = x+1
        if x < len(start):
            print ","
        print '\n'

    print("};");

