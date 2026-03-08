const DateUtil = {

  today(){

    return new Date();

  },

  tomorrow(){

    const d = new Date();
    d.setDate(d.getDate()+1);
    return d;

  },

  year(){

    return new Date().getFullYear();

  },

  format(date){

    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2,"0");
    const d = String(date.getDate()).padStart(2,"0");

    return `${y}-${m}-${d}`;

  }

};

window.DateUtil = DateUtil;
