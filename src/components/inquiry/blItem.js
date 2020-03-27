import React, { Component } from 'react';
import $ from 'jquery'

import config from "../../config/wxconfig";
import imgUrl from './images'

class blItem extends Component {
    change(e) {
        let _this = $(e.currentTarget);
        if(_this.hasClass('down')){
            _this.removeClass('down').addClass('up').attr('src', imgUrl.up).parent().next().addClass('show');
        }else{
            _this.removeClass('up').addClass('down').attr('src', imgUrl.down).parent().next().removeClass('show');
        }
    }
    setTxt(a) {
        return <div>
            {
                a.txtArr.map((b, index) => {
                    let c;
                    if (b.type !== 12){
                        c = JSON.parse(b.txt);
                    }
                    if(b.type === 8){
                        return  <div className="asdf" key={index}>
                                    <p>检查情况</p>
                                    {
                                        c !== 1 ? `已检查${c.numberOfInspections}次, 上次检查时间${c.lastCheckTime}` : '无' 
                                    }
                                </div>
                    }else if(b.type === 9){
                        return  <div className="asdf" key={index}>
                                    <p>怀孕情况</p>
                                    {
                                        c !== 1 ? `已怀孕${c.pregnancyMonth}个月, 预产期${c.dueDate}` : '无' 
                                    }
                                </div>
                    }else if(b.type === 10){
                        return  <div className="asdf" key={index}>
                                    <p>月经史</p>
                                    {
                                        c !== 1 ?   `初潮${c.menarcheAge}岁,
                                                    经期${c.menstruation}天, 
                                                    周期${c.menstruationCycle}天,
                                                    上次月经时间${c.lastMenstrualDate}` 
                                                    : '无'
                                    }
                                    
                                </div>
                    }else if(b.type === 11){
                        return  <div className="asdf" key={index}>
                                    <p>生育史</p>
                                    {
                                        c !== 1 ?   `足月产${c.fulltimeProduction}次,
                                                    早产${c.numberOfPretermBirths}次, 
                                                    流产${c.numberOfAbortions}次, 
                                                    现存子女${c.numberOfChildren}人`
                                                    : '无'
                                    }
                                    
                                </div>
                    }else if(b.type === 13){
                        if(c !== 1){
                            let str = '';
                            for(let d of c.data){
                                str += `${d.allergies}(${d.allergyDegree+d.allergicSymptoms})、`
                            }
                            return <div className="asdf" key={index}><p>过敏史</p>{str}</div>
                        }else{
                            return <div className="asdf" key={index}><p>过敏史</p>无</div>
                        }
                    }else{
                        return <div className="asdf" key={index}><p>重要疾病史</p>{b.txt === '1' ? '无' : b.txt}</div>
                    }
                })
            }
        </div>
      
    }
    render() {
        let {data} = this.props;
        return (
            <div>
                {
                    data.map((item, index) => {
                        return  <div className="wz_bl_item" key={index}>
                                    <div className="title">
                                        {item.title}
                                        <img src={imgUrl.down } className="down" alt="" onClick={e => this.change(e)}/>
                                    </div>
                                    <div className={`wz_bl_item_con`}>
                                        {
                                            item.type !== 14 && item.txtArr.length > 0 ? item.txtArr.map((item1, index1) => {
                                                return <div className="wz_bl_item_con_txt" key={index1}>{item1}</div>
                                            }) : ''
                                        }
                                        {
                                            item.type === 14 ? this.setTxt(item) : ''
                                        }
                                        
                                        {
                                            item.imgArr.length > 0 ? item.imgArr.map((item1, index1) => {
                                                return  <div key={index1} className="wz_bl_item_con_img">
                                                            {
                                                                item.type == 4 ? <p>病情相关照片</p> : ''
                                                            }
                                                            {
                                                                item.type == 1 ? <p>就诊相关资料</p> : ''
                                                            }
                                                            {
                                                                item.type == 3 ? <p>药物相关资料</p> : ''
                                                            }
                                                            <img src={config.publicStaticUrl + item1} alt="" />
                                                        </div>
                                            }) : ''
                                        }
                                        {
                                            item.type == 4 && item.txtArr1.length > 0 ? item.txtArr1.map((item1, index1) => {
                                                return  <div key={index1} className="wz_bl_item_con_img">
                                                            <p>补充病情相关资料</p>
                                                            <div className="wz_bl_item_con_txt">{item1}</div>
                                                        </div>
                                            }) : ''
                                        }
                                        {
                                            item.type == 4 && item.imgArr1.length > 0 ? item.imgArr1.map((item1, index1) => {
                                                return <img src={config.publicStaticUrl + item1} alt=""  key={index1} />
                                            }) : ''
                                        }
                                        </div>
                                    </div>
                    })
                }
            </div>
        );
    }
}

export default blItem;