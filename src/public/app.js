(function () {
	'use strict';

	const canvas = document.getElementById('particleCanvas');
	if (!canvas) return;

	const ctx = canvas.getContext('2d');
	let particles = [];
	let mouse = { x: -1000, y: -1000 };

	function resize() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}

	window.addEventListener('resize', resize);
	resize();

	class Particle {
		constructor() {
			this.reset();
		}

		reset() {
			this.x = Math.random() * canvas.width;
			this.y = Math.random() * canvas.height;
			this.size = Math.random() * 2.5 + 0.5;
			this.speedX = (Math.random() - 0.5) * 0.08;
			this.speedY = (Math.random() - 0.5) * 0.08;
			this.opacity = Math.random() * 0.12 + 0.03;
			this.baseOpacity = this.opacity;
			this.color = Math.random() > 0.5 ? 'rgba(235, 66, 126,' : 'rgba(200, 80, 140,';
		}

		update() {
			this.x += this.speedX;
			this.y += this.speedY;

			const dx = this.x - mouse.x;
			const dy = this.y - mouse.y;
			const dist = Math.sqrt(dx * dx + dy * dy);
			if (dist < 100) {
				const force = ((100 - dist) / 100) * 0.2;
				this.x += (dx / dist) * force;
				this.y += (dy / dist) * force;
				this.opacity = Math.min(this.baseOpacity + 0.15, 0.35);
			} else {
				this.opacity += (this.baseOpacity - this.opacity) * 0.02;
			}

			if (this.x < -10) this.x = canvas.width + 10;
			if (this.x > canvas.width + 10) this.x = -10;
			if (this.y < -10) this.y = canvas.height + 10;
			if (this.y > canvas.height + 10) this.y = -10;
		}

		draw() {
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
			ctx.fillStyle = this.color + this.opacity + ')';
			ctx.fill();
		}
	}

	const count = Math.min(Math.floor((canvas.width * canvas.height) / 25000), 40);
	for (let i = 0; i < count; i++) {
		particles.push(new Particle());
	}

	function animate() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		particles.forEach((p) => {
			p.update();
			p.draw();
		});

		for (let i = 0; i < particles.length; i++) {
			for (let j = i + 1; j < particles.length; j++) {
				const dx = particles[i].x - particles[j].x;
				const dy = particles[i].y - particles[j].y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < 80) {
					ctx.beginPath();
					ctx.moveTo(particles[i].x, particles[i].y);
					ctx.lineTo(particles[j].x, particles[j].y);
					ctx.strokeStyle = `rgba(235, 66, 126, ${0.015 * (1 - dist / 80)})`;
					ctx.lineWidth = 0.5;
					ctx.stroke();
				}
			}
		}

		requestAnimationFrame(animate);
	}

	animate();

	document.addEventListener('mousemove', (e) => {
		mouse.x = e.clientX;
		mouse.y = e.clientY;
	});

	document.addEventListener('mouseleave', () => {
		mouse.x = -1000;
		mouse.y = -1000;
	});

	const downloadBtn = document.getElementById('downloadBtn');
	const statusEl = document.getElementById('statusText');
	const btnLabel = document.getElementById('btnLabel');
	const btnSpinner = document.getElementById('btnSpinner');
	const progressTrack = document.getElementById('progressTrack');

	if (downloadBtn) {
		downloadBtn.addEventListener('click', () => {
			downloadBtn.disabled = true;
			downloadBtn.classList.add('is-loading');
			if (btnLabel) btnLabel.textContent = 'Preparing Export…';
			if (btnSpinner) btnSpinner.style.display = 'block';
			if (statusEl) statusEl.classList.add('is-visible');

			if (progressTrack) {
				progressTrack.style.transition = 'none';
				progressTrack.style.width = '0%';
				progressTrack.offsetHeight;
				progressTrack.style.transition = 'width 6s linear';
				progressTrack.style.width = '90%';
			}

			window.location.href = '/download';

			downloadBtn.disabled = false;
			downloadBtn.classList.remove('is-loading');
			if (btnLabel) btnLabel.textContent = 'Export Candidates CSV';
			if (btnSpinner) btnSpinner.style.display = 'none';

			if (statusEl) {
				statusEl.innerHTML = '<span class="status__check">✓</span> Download complete';
				setTimeout(() => {
					statusEl.classList.remove('is-visible');
					setTimeout(() => {
						statusEl.innerHTML = '<span class="status__check">↓</span> Preparing your export…';
					}, 500);
				}, 3000);
			}

			if (progressTrack) {
				progressTrack.style.transition = 'width 0.3s ease';
				progressTrack.style.width = '100%';
				setTimeout(() => {
					progressTrack.style.transition = 'none';
					progressTrack.style.width = '0%';
				}, 400);
			}
		});
	}

	const card = document.querySelector('.card');
	if (card) {
		const scene = card.closest('.scene');
		if (scene) {
			scene.addEventListener('mousemove', (e) => {
				const rect = scene.getBoundingClientRect();
				const x = (e.clientX - rect.left) / rect.width - 0.5;
				const y = (e.clientY - rect.top) / rect.height - 0.5;
				card.style.transform = `perspective(1000px) rotateY(${x * 2}deg) rotateX(${-y * 2}deg)`;
			});

			scene.addEventListener('mouseleave', () => {
				card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
				card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
				setTimeout(() => {
					card.style.transition = '';
				}, 600);
			});
		}
	}
})();
