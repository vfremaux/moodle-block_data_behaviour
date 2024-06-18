This directory serves as extension dir to store additional data mappings for some specific applications.

Data mappings are json files mapping a remote form field to a moodle value description. Moodle value descirption adopts
the MoodleScript descriptor syntax, i.e. : <objectref>:<fieldref>, while <objectref> is in turn : <objectsource>:<identifier>:<idvalue>

Examples : 

user:id:354:firstname
user:id:354:lastname
user:id:354:profile_field_customfield
course:id:3:idnumber

user:current:firstname

Using current as identifier name will adress the current session $USER (resp. course) value.

etc.
