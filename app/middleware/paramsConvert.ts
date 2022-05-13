
// 节点搜索解析中间件
module.exports = () =>{
	return  async function paramsConvert(ctx, next) {
		const params:any = {};
		let flag: boolean = true;
		const body: string = ctx.request.body.searchParams;
		if(body=="") flag = false;
		const node = body.split(/[?,>]/g);
		if(body.includes('>')){
			params.type = 'link';
		}else if(body.includes('?')){
			params.type = 'condition';
		}else{
			params.type = 'node';
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