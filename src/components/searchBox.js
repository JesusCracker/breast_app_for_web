import React, {Component} from 'react';
import {InputItem, SearchBar,Icon} from "antd-mobile";
import {is} from "immutable";
import '../less/searchBox.less'

class SearchBox extends Component {
    constructor(props) {
        super(props);
        const {placeholder,isFocus,value}=this.props;


        this.state = {
            focus:isFocus,
            value:value,
        };

    }
    componentDidMount() {

        if(this.state.focus===true){
            this.autoFocusInst.focus();
        }
    }

    sendData(value){
        this.props.parent.getData(value);
    }

    clearData(){
        this.props.parent.clear();
    }

    getKeyWords(v){

        this.props.parent.onChange(v);
    }

    render() {
        const {placeholder,isFocus,value}=this.props;

        return (
            <div>
                {value?<SearchBar
                    value={value}

                    cancelText={<Icon type="cross-circle-o"  size={'md'}/>}
                    ref={ref => this.autoFocusInst = ref}
                    placeholder={placeholder}
                    onSubmit={(value)=>{this.sendData(value)}}
                    onClear={()=>this.clearData()}
                    /* onFocus={() => console.log('onFocus')}
                     onBlur={() => console.log('onBlur')}
                     onCancel={() => console.log('onCancel')}*/
                    showCancelButton={false}
                    onChange={(v)=>this.getKeyWords(v)}
                />:<SearchBar
                    cancelText={<Icon type="cross-circle-o"  size={'md'}/>}
                    ref={ref => this.autoFocusInst = ref}
                    placeholder={placeholder}
                    onSubmit={(value)=>{this.sendData(value)}}
                    onClear={()=>this.clearData()}
                    /* onFocus={() => console.log('onFocus')}
                     onBlur={() => console.log('onBlur')}
                     onCancel={() => console.log('onCancel')}*/
                    showCancelButton={false}
                    onChange={(v)=>this.getKeyWords(v)}
                />}
            </div>
        );
    }
}

export default SearchBox;

