(() => {
    // JS 실행 블록 (결괏값 반환용)
    Entry.block['eval_value'] = {
        skeleton: 'basic_string_field',
        color: '#080401',
        params: [{ type: 'Block', accept: 'string', defaultType: 'text' }],
        paramsKeyMap: { CODE: 0 },
        func(sprite, script) {
            const jsCode = script.getStringValue('CODE', script);
            const p = script.executor.register?.params || [];
            return eval(jsCode);
        }
    };
    
    // @log 함수 교체
    Object.values(Entry.variableContainer.functions_).forEach(func => {
        if (func.block?.template === ' @log %1 ( %2 )@' && func.type === 'value') {
            func.content.load([
                [{ 
                    type: 'function_create_value',
                    x: 40, y: 40, 
                    params: [
                        func.content.getThreads()[0]?.getFirstBlock()?.params[0], 
                        null, null, 
                        { 
                            type: 'eval_value',
                            params: ['Math.log(p[1] || 1) / Math.log(p[0] || 10)']
                        }
                    ],
                    statements: [[]]
                }]
            ]);
            Entry.variableContainer.saveFunction(func);
        }
    });
})();
