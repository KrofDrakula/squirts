describe('Blob', function() {
    describe('Calculated properties', function() {
        it('#mass', function() {
            var b = new Blob({
                position : new Vector2d(0, 0),
                speed    : new Vector2d(0, 0),
                radius   : 10
            });

            b.mass.should.equal(100 * Math.PI);

            b.mass += 100;

            b.mass.should.be.closeTo(100 * Math.PI + 100, 0.01);
        });

        it('#momentum', function() {
            var b = new Blob({
                position : new Vector2d(0, 0),
                speed    : new Vector2d(0, 0),
                radius   : 10
            });

            b.momentum.should.be.deep.equal(new Vector2d(0, 0));

            b.speed = b.speed.add(1);

            b.momentum.x.should.be.closeTo(Math.PI * 100, 0.01);
            b.momentum.y.should.be.closeTo(Math.PI * 100, 0.01);
        });

        it('#intersectsWith(blob)', function() {
            var a = new Blob({
                position : new Vector2d(0, 0),
                speed    : new Vector2d(0, 0),
                radius   : 4
            });

            var b = new Blob({
                position : new Vector2d(5, 0),
                speed    : new Vector2d(0, 0),
                radius   : 1.1
            });

            a.intersectsWith(b).should.be.true;
            b.position.x -= 2;
            a.intersectsWith(b).should.be.true;
            b.position.x += 4;
            a.intersectsWith(b).should.be.false;
        });
    });
});