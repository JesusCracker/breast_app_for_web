import React, {Component} from 'react';

class GetGroup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

    }

    componentDidMount() {

        this.getGroup();
    }

    getGroup(){
        var obg={},a='';
        (a=window.location.search.substr(1))&&(a=window.location.search.split('?')[1])
        // console.dir(window.location.search.split('?')[1]);
        a.split(/&/g).forEach(function(item){
            obg[(item=item.split('='))[0]]=item[1];


        });
        console.dir(window.location.search.substr(1))
        return obg
    }


}

GetGroup.propTypes = {};

export default GetGroup;