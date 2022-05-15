
// 节点搜索解析中间件
module.exports = () =>{
	return  async function paramsConvert(ctx, next) {
		const params:any = {};
		let flag: boolean = true;
		const body: string = ctx.request.body.searchParams;
		if(body=="") flag = false;
		let node = body.split(/[?,>]/g);
		const reg = /[a-zA-Z]+/g
		if(body.includes('>')){
			params.type = 'link';
		}else if(body.includes('?')){
			params.type = 'condition';
		}
		else if(reg.test(body)){
			params.type = 'node';
		}
		else{
			params.type = 'communities';
			node.forEach(item => Number.parseInt(item));
		}
		params.node = node;
		ctx.request.body = params;
		if(flag) {
			await next();
		}
		else{
			ctx.body='no params';
		}
	}
}