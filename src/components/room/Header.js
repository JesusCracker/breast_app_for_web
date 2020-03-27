import React, { Component } from 'react';

class Header extends Component {
    constructor(props) {
		super(props);
		this.state = {
			navs: [
				{ name: '简介', page: 0, isActive: true },
				{ name: '直播', page: 1, isActive: false },
				{ name: '互动', page: 2, isActive: false }
			]
		};
    }
    
    
    // nav 点击
	switch(page) {

		this.state.navs.map((item) => {
			if (item.page === page) {
				item.isActive = true;
				return '';
			}
			item.isActive = false;
		});

        
        this.props.pfn(page);
	}


    render() {
        this.state.navs.map(item => {
            if(item.page === this.props.content){
                item.isActive = true;
                return '';
            }
            item.isActive = false;
        })
        return (
            <div className="headers">
                {this.state.navs.map((item, index) => {
                    return (
                        <span
                            className={item.isActive ? 'active' : ''}
                            onClick={this.switch.bind(this, item.page)}
                            key={index}
                        >
                            {item.name}
                        </span>
                    );
                })}
            </div>
        );
    }
}

export default Header;